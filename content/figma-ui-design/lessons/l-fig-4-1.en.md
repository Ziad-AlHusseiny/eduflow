---
summary: Prototype Steady's check-in flow with triggers, actions and animations, make the check button an interactive component, open the New habit sheet as an overlay and use smart animate correctly.
takeaways:
  - Every prototype interaction is a trigger (such as On tap) plus an action (such as Navigate to or Open overlay) plus an animation.
  - Interactive components put interactions between variants inside the component, so every instance of the check button toggles on its own.
  - Overlays show content such as a bottom sheet above the current screen, with settings for position, closing on outside tap and a background.
  - Smart animate pairs layers by name and position in the layer tree, then animates position, size, rotation, opacity and fills between them.
  - Prototype the moments you need to test or explain, not every screen, and keep each flow short enough to finish in a minute.
further:
  - title: Guide to prototyping in Figma
    url: https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma
  - title: Prototype triggers
    url: https://help.figma.com/hc/en-us/articles/360040035834-Prototype-triggers
  - title: Smart animate layers between frames
    url: https://help.figma.com/hc/en-us/articles/360039818874-Smart-animate-layers-between-frames
  - title: Create overlays in your prototypes
    url: https://help.figma.com/hc/en-us/articles/360039818254-Create-overlays-in-your-prototypes
quiz:
  - q: You want every habit row's check button to toggle between To do and Done in the prototype, on every screen. What is the most efficient setup?
    options:
      - text: Draw a connection from each check button on each screen to a copy of that screen with the button checked.
        why: That needs a new screen for every combination of checked rows, which explodes quickly.
      - text: Add an On tap, Change to Done interaction between the variants inside the Check button component set.
        why: Correct. Interactions inside the component make every instance interactive, with no extra screens.
      - text: Use After delay so buttons check themselves.
        why: Testers need to tap. A timed change does not test whether people find the button.
      - text: Export the screens and add interactions in a video editor.
        why: A video cannot respond to taps, so you lose what makes a prototype useful.
    answer: 1
  - q: "The New habit sheet should slide up from the bottom over the Today screen and close when someone taps the dimmed area. Which setup fits?"
    options:
      - text: Navigate to a copy of Today with the sheet drawn on it, using Instant.
        why: It looks similar but the sheet cannot be dismissed by tapping outside, and you maintain a second Today screen.
      - text: Scroll to the sheet's position on a long Today frame.
        why: Scrolling would move the whole screen, not slide a sheet over it.
      - text: Open overlay with the sheet frame, positioned at the bottom center, with a background behind it and closing on outside click turned on.
        why: Correct. That is exactly what overlays are for, and the settings live on the overlay so every connection reuses them.
      - text: Change to a variant of the Today frame.
        why: Change to works on component variants, and the Today screen is a frame, not a component set.
    answer: 2
  - q: In the first frame the streak badge is hidden with the eye icon. In the second it is visible. Smart animate makes it pop in instead of fading. What is the fix?
    options:
      - text: Increase the duration to 2,000 ms.
        why: A longer duration does not help when there is no animatable change. Visibility toggles instantly.
      - text: Switch the animation to Dissolve.
        why: Dissolve fades the whole frame, not the badge on its own.
      - text: Rename the badge in the second frame.
        why: Different names would stop smart animate matching it at all. The names should be identical.
      - text: Keep the badge visible in both frames and set its opacity to 0% in the first frame.
        why: Correct. Smart animate animates opacity values, but a hidden layer has no opacity to animate from.
    answer: 3
---

A static mock-up shows what Steady looks like. A prototype shows how it feels: does tapping the check button give a satisfying response, does the New habit sheet come from where people expect, can someone find their way back? Testing those questions with a prototype costs an afternoon. Testing them after development costs a sprint.

## Interactions: trigger, action, animation

Switch the right sidebar to the **Prototype** tab. Select a layer, drag the connection handle that appears onto a destination frame, and you have created an **interaction**. Every interaction has three parts.

The **trigger** is what the person does. At the time of writing, the triggers include On click/On tap, On drag, While hovering, While pressing, Key/Gamepad, Mouse enter, Mouse leave, Mouse down, Mouse up and After delay. For a phone app you mostly use On tap, plus On drag for swipe gestures.

The **action** is what happens. The common ones are **Navigate to** another frame, **Back**, **Change to** another variant of a component, **Open overlay**, **Swap overlay**, **Close overlay** and **Scroll to**. Advanced prototypes can also set variables and use conditionals, which are plan-dependent.

The **animation** is how it moves: Instant, Dissolve, Smart animate, or directional ones such as Move in, Push and Slide in, each with easing and a duration. For Steady, short and calm works best: Smart animate or Push, Ease out, about 250 to 300 ms.

Here is the check-in flow you will build:

:::figure Steady's check-in prototype flow
<svg viewBox="0 0 680 260" role="img" aria-labelledby="t1">
  <title id="t1">The Today screen is the starting point. Tapping a check button changes the row to Done inside the component. Tapping the add button opens the New habit sheet as an overlay, and Save closes it. Tapping a row navigates to Habit detail, and Back returns.</title>
  <rect class="d-box-primary" x="250" y="90" width="180" height="70" rx="14"/>
  <text class="d-label-strong" x="340" y="122" text-anchor="middle">Today</text>
  <text class="d-label-muted" x="340" y="144" text-anchor="middle">flow starting point</text>
  <rect class="d-box-success" x="20" y="20" width="180" height="56" rx="12"/>
  <text class="d-label" x="110" y="45" text-anchor="middle">Row: Done</text>
  <text class="d-label-muted" x="110" y="64" text-anchor="middle">Change to (in component)</text>
  <path class="d-arrow" d="M250 105 L202 66" marker-end="url(#arrow)"/>
  <rect class="d-box-accent" x="480" y="20" width="180" height="56" rx="12"/>
  <text class="d-label" x="570" y="45" text-anchor="middle">New habit sheet</text>
  <text class="d-label-muted" x="570" y="64" text-anchor="middle">Open overlay</text>
  <path class="d-arrow" d="M430 105 L478 66" marker-end="url(#arrow)"/>
  <rect class="d-box" x="250" y="200" width="180" height="50" rx="12"/>
  <text class="d-label" x="340" y="230" text-anchor="middle">Habit detail</text>
  <path class="d-arrow" d="M320 160 L320 198" marker-end="url(#arrow)"/>
  <path class="d-arrow d-dashed" d="M360 198 L360 162" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="300" y="184" text-anchor="end">tap row: Push</text>
  <text class="d-label-muted" x="380" y="184">Back</text>
  <path class="d-arrow d-dashed" d="M520 78 L430 128" marker-end="url(#arrow)"/>
  <text class="d-label-muted" x="560" y="110">Save: Close overlay</text>
</svg>
:::

## Interactive components: the check button

You could draw a connection from every check button to a copy of the screen with that row checked. With five habits that is 32 combinations of screens. Instead, open the **Check button** component set and add the interaction *between its variants*: on the To do variant, On tap, **Change to** Done, Smart animate, 200 ms. Add the reverse on Done.

Now every instance of the check button, on every screen, toggles on its own when tapped in the prototype. This is an **interactive component**, and it is why Lesson 3.2's careful variants pay off twice.

## Overlays: the New habit sheet

The add button opens the New habit sheet, which slides up over Today rather than replacing it. Connect the add button to the sheet frame with **Open overlay**. In the overlay settings, choose a bottom center position, turn on closing when clicking outside, and add a background behind the overlay (a dark color at about 40% opacity dims the screen). Use a Move in from bottom animation.

Overlay settings belong to the overlay frame, not to the connection, so every button that opens the sheet reuses them. Inside the sheet, wire Save habit and Cancel to **Close overlay**.

## Smart animate: matching layers

Smart animate looks at two frames, finds layers that match, and animates the differences. A layer matches when it has the **same name** and sits in the **same place in the layer hierarchy** in both frames. It can animate position, size, rotation, opacity and fills.

For the streak celebration on Habit detail, duplicate the frame (duplicating keeps the names identical), then in the second frame enlarge the streak number and fade in a "New best!" badge. Connect with Smart animate, Ease out, 300 ms.

:::mistake Hidden layers and renamed layers
Smart animate cannot fade in a layer that is hidden with the eye icon; there is no opacity to start from. Keep the badge visible and set its opacity to 0% in the first frame. And if you renamed the badge to `Badge copy` in one frame or moved it into another group, smart animate sees two unrelated layers and the badge pops in. Named layers from Lesson 1.4 are what make this work.
:::

## Presenting and scrolling

Set Today as a flow starting point and press the play button to present. On a long list, set the content frame to scroll vertically and keep the tab bar fixed in place, both from the Prototype tab at the time of writing. Test on a real phone with the Figma mobile app; a 300 ms animation that looks slow on a monitor often feels right in the hand.

:::tip Prototype the question, not the app
Before wiring anything, write down what you want to learn: "Do people find the add button?" or "Is checking a habit satisfying?". Prototype the screens that answer it and nothing else. A focused five-screen prototype gets better feedback than a forty-screen maze.
:::

Next you make sure the screens you just animated work for everyone, including people who cannot see the teal, cannot tap small targets or use a screen reader.
