---
summary: Lay out a VPC with public and private subnets in two Availability Zones, explain what makes a subnet public, and lock traffic down with security groups and network ACLs.
takeaways:
  - A VPC is your private network in one Region, and each subnet is an address range inside a single Availability Zone.
  - A subnet is public only because its route table sends 0.0.0.0/0 to an internet gateway; private subnets have no such route.
  - Security groups are stateful allow-lists attached to resources, and they can name another security group as the allowed source.
  - Network ACLs are stateless rule lists on subnets, evaluated in number order, and can deny as well as allow.
  - NAT gateways and public IPv4 addresses bill by the hour, while gateway endpoints let private subnets reach S3 and DynamoDB at no extra charge.
further:
  - title: How Amazon VPC works
    url: https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html
  - title: Control traffic to your AWS resources using security groups
    url: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html
  - title: Control subnet traffic with network access control lists
    url: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html
  - title: Gateway endpoints
    url: https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html
quiz:
  - q: Two subnets in Lantern's VPC are identical except that one has a route `0.0.0.0/0 → igw-0abc…` in its route table. What does that route change?
    options:
      - text: Nothing, until a security group allows traffic.
        why: The route is what makes the subnet public at all. Security groups then filter traffic for each resource, but they are a separate layer.
      - text: It encrypts traffic leaving that subnet.
        why: Routes decide where packets go, not how they are protected. Encryption comes from TLS or other protocols.
      - text: It lets resources in the other subnet reach the internet too.
        why: Each subnet uses its own route table. The other subnet still has no route to the internet gateway.
      - text: It makes that subnet public, so resources there with public IP addresses can talk to the internet directly.
        why: Correct. A route to an internet gateway is the definition of a public subnet in AWS.
    answer: 3
  - q: Lantern's database security group must accept PostgreSQL connections only from the app servers. Which inbound rule is best?
    options:
      - text: TCP 5432 from the app servers' security group.
        why: Correct. Referencing a security group keeps working when app servers are replaced or scaled, without tracking IP addresses.
      - text: TCP 5432 from 0.0.0.0/0, because the database is in a private subnet anyway.
        why: A private subnet is one layer of protection. Allowing the whole internet removes the second layer and lets anything inside the VPC connect.
      - text: All traffic from the VPC's CIDR range.
        why: That lets every resource in the VPC reach every port on the database, which is far wider than the app needs.
      - text: TCP 5432 from the current private IP address of each app server.
        why: It works until an instance is replaced and gets a new address. Then connections fail, or a stranger's instance inherits the old IP.
    answer: 0
  - q: A network ACL allows inbound TCP 443 from anywhere, but HTTPS requests to an instance in the subnet time out, while its security group allows 443. What is the likely cause?
    options:
      - text: Security groups override network ACLs, so the ACL is ignored.
        why: Both layers apply. Traffic must pass the network ACL and the security group.
      - text: The instance needs a NAT gateway to answer requests.
        why: A NAT gateway is for private resources starting outbound connections. Replies to inbound requests in a public subnet go through the internet gateway.
      - text: Network ACLs are stateless, so the outbound rules must also allow the reply traffic to ephemeral ports.
        why: Correct. Unlike security groups, a network ACL does not remember the connection, so return traffic needs its own allow rule.
      - text: Port 443 is blocked by AWS on new accounts.
        why: AWS does not block 443 for your resources. Inbound traffic is controlled by your own network ACLs and security groups.
    answer: 2
---

Lantern's old server had a public IP address and a firewall that, honestly, nobody had looked at in two years. Its database listened on port 5432 on the same machine. On AWS the database will run on its own, and the first question is: who can even reach it? The answer is designed in **Amazon VPC**, your private network inside AWS.

## A VPC and its subnets

A **VPC** (virtual private cloud) is an isolated network in one Region with an IP range you choose, such as `10.0.0.0/16` (65,536 addresses). Every Region gives each account a **default VPC** with public subnets, handy for experiments; production gets a VPC you design.

A **subnet** is a slice of that range inside **one Availability Zone**, such as `10.0.1.0/24` (256 addresses, of which AWS reserves five). Because subnets are zonal, resilience means pairs: Lantern uses two AZs, each with one public and one private subnet.

:::figure Lantern's VPC: public and private subnets in two Availability Zones
<svg viewBox="0 0 700 330" role="img" aria-labelledby="t1">
  <title id="t1">A VPC with CIDR 10.0.0.0/16 spans two Availability Zones, each with a public and a private subnet. The public subnets route to the internet gateway. Private subnets in both AZs hold the database and app and send outbound traffic through one NAT gateway in AZ a.</title>
  <rect class="d-box-warn" x="300" y="8" width="120" height="36" rx="8"/>
  <text class="d-label" x="360" y="31" text-anchor="middle">Internet gateway</text>
  <rect class="d-box" x="20" y="56" width="660" height="262" rx="14"/>
  <text class="d-label-strong" x="40" y="80">VPC 10.0.0.0/16</text>
  <rect class="d-box" x="40" y="92" width="300" height="214" rx="10"/>
  <text class="d-label-muted" x="190" y="112" text-anchor="middle">AZ a</text>
  <rect class="d-box" x="360" y="92" width="300" height="214" rx="10"/>
  <text class="d-label-muted" x="510" y="112" text-anchor="middle">AZ b</text>
  <rect class="d-box-accent" x="60" y="122" width="260" height="70" rx="8"/>
  <text class="d-label" x="190" y="146" text-anchor="middle">Public 10.0.1.0/24</text>
  <text class="d-code" x="190" y="172" text-anchor="middle">NAT gateway</text>
  <rect class="d-box-primary" x="60" y="212" width="260" height="80" rx="8"/>
  <text class="d-label" x="190" y="238" text-anchor="middle">Private 10.0.11.0/24</text>
  <text class="d-code" x="190" y="266" text-anchor="middle">RDS primary, app</text>
  <rect class="d-box-accent" x="380" y="122" width="260" height="70" rx="8"/>
  <text class="d-label" x="510" y="146" text-anchor="middle">Public 10.0.2.0/24</text>
  <text class="d-code" x="510" y="172" text-anchor="middle">load balancer (later)</text>
  <rect class="d-box-primary" x="380" y="212" width="260" height="80" rx="8"/>
  <text class="d-label" x="510" y="238" text-anchor="middle">Private 10.0.12.0/24</text>
  <text class="d-code" x="510" y="266" text-anchor="middle">RDS standby, app</text>
  <path class="d-arrow" d="M190 122 L330 44" marker-end="url(#arrow)"/>
  <path class="d-arrow" d="M510 122 L390 44" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M150 212 L150 194" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M400 220 L280 192" marker-end="url(#arrow)"/>
</svg>
:::

## What makes a subnet public

Nothing about the subnet itself. It is the **route table**:

```text
Public route table               Private route table
10.0.0.0/16  -> local            10.0.0.0/16  -> local
0.0.0.0/0    -> igw-0abc...      0.0.0.0/0    -> nat-0def...
```

A subnet whose route table sends `0.0.0.0/0` (everything not local) to an **internet gateway** is public: a resource there with a public IP can talk to the internet and be reached from it. A private subnet has no route to the internet gateway, so nothing on the internet can start a connection to it. If private resources need to start outbound connections, say to download OS updates, they route through a **NAT gateway** that sits in a public subnet.

Lantern's database and the migration server go in **private** subnets. The public subnets hold only the NAT gateway and, later, a load balancer.

:::tip The cheapest route to S3 is a gateway endpoint
NAT gateways bill per hour and per gigabyte processed, and Lantern's private server pulls a lot from S3. A **gateway endpoint** for S3 (and one for DynamoDB) adds a route that keeps that traffic inside AWS, with no hourly or per-gigabyte charge. Add both to every VPC with private subnets.
:::

## Security groups: stateful firewalls on resources

A **security group** is an allow-list attached to a resource's network interface: an instance, an RDS database, a Lambda function inside the VPC. Three properties make them pleasant to work with:

- **Allow rules only.** Anything not allowed is denied. New groups allow no inbound traffic and all outbound.
- **Stateful.** If a request is allowed in, the reply is allowed out automatically.
- **They can reference each other.** "Allow 5432 from the `lantern-app-sg` group" means "from anything wearing that group", however many instances that is and whatever their IPs.

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-0db1111111111111a \
  --protocol tcp --port 5432 \
  --source-group sg-0app222222222222b
```

That one rule says it all: the database accepts PostgreSQL from the app tier and nothing else.

:::mistake Opening SSH to the world
A rule allowing port 22 from `0.0.0.0/0` gets scanned within minutes of creation, and every weak password or unpatched SSH daemon becomes your problem. You don't need inbound SSH at all: **AWS Systems Manager Session Manager** opens a shell through the SSM agent with IAM permissions and logging, and no inbound port. If you must use SSH, allow it only from a known address range.
:::

## Network ACLs: stateless rules on subnets

A **network ACL** filters traffic at the subnet boundary. It differs from a security group in every way:

| | Security group | Network ACL |
|---|---|---|
| Attached to | Resources (network interfaces) | Subnets |
| Rules | Allow only | Allow and deny |
| State | Stateful: replies allowed | Stateless: replies need rules |
| Order | All rules considered | Lowest rule number first, first match wins |

Because ACLs are stateless, allowing inbound 443 is not enough: the reply leaves from port 443 to the client's ephemeral port (1024–65535), and the outbound rules must allow that too. The default network ACL allows everything both ways, and most teams leave it that way and do the real work in security groups. Reach for a custom ACL when you need a subnet-wide **deny**, such as blocking an abusive address range.

## What this costs

The VPC, subnets, route tables, security groups and ACLs are free. What bills is what you put in them: **NAT gateways** per hour plus per gigabyte, **public IPv4 addresses** per hour, and **cross-AZ traffic** per gigabyte. One NAT gateway per AZ is the resilient choice; a single shared one saves money and accepts that an AZ failure cuts private outbound traffic. For Lantern's size, the sensible default is one NAT gateway plus gateway endpoints, and revisit when traffic grows. (Since late 2025 AWS also offers a *regional* NAT gateway that spreads across AZs by itself and needs no public subnet; compare its price before you switch.)

That completes the core services. Section four puts them together and ships the new Lantern.
