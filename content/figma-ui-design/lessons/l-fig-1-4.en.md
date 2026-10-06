---
summary: Build Steady's first screen from frames, text and shapes, choose correctly between frames, groups and sections, name layers by role, and pin elements with constraints so the screen survives resizing.
takeaways:
  - A frame is a container with its own size, fill, clipping, layout and constraints; a group is only a bundle whose size follows its children.
  - Default to frames for anything that is part of the UI, and keep groups for loose visual clusters such as an illustration.
  - The layers panel order is stacking order, and layer names should describe roles, because handoff, prototyping and components all read them.
  - Constraints tell a child how to move or stretch when its parent frame resizes, such as a tab bar pinned left and right and to the bottom.
  - Test constraints by resizing the frame to a smaller and a larger phone before you call a screen done.
further:
  - title: Frames in Figma Design
    url: https://help.figma.com/hc/en-us/articles/360041539473-Frames-in-Figma-Design
  - title: Apply constraints to define how layers resize
    url: https://help.figma.com/hc/en-us/articles/360039957734-Apply-constraints-to-define-how-layers-resize
  - title: Explore the navigation bar and left sidebar
    url: https://help.figma.com/hc/en-us/articles/360039831974-View-layers-and-pages-in-the-left-sidebar
quiz:
  - q: You draw a 393 × 852 phone screen, put a tab bar at the bottom, and set the tab bar's constraints to Left and right plus Top. What happens when you resize the screen to 430 × 932?
    options:
      - text: The tab bar stays at its old distance from the top, so it floats above the new bottom edge.
        why: Correct. Top keeps the distance to the top edge fixed. A bottom bar needs the Bottom constraint.
      - text: The tab bar moves to the new bottom edge because Figma detects bottom bars.
        why: Figma does not guess intent. It applies exactly the constraints you set.
      - text: The tab bar scales up proportionally in height and width.
        why: That would be the Scale constraint. Left and right stretches the width only, and Top fixes vertical position.
      - text: Nothing changes, because constraints only apply in prototypes.
        why: Constraints apply on the canvas whenever the parent frame is resized, not just in prototypes.
    answer: 0
  - q: When is a group a better choice than a frame?
    options:
      - text: For the habit row, so its background can stretch with the screen.
        why: Groups cannot hold their own fill or apply constraints to children like a frame does. A row needs a frame.
      - text: For the whole screen, because groups export faster.
        why: Export speed is not the difference. Screens need frames for size, clipping, prototyping and layout.
      - text: For a decorative illustration made of several shapes that should move together.
        why: Correct. A loose visual cluster with no layout behaviour of its own is what groups are for.
      - text: Whenever you want to add auto layout later.
        why: Auto layout lives on frames. Adding it to a group's contents wraps them in a new frame anyway.
    answer: 2
  - q: "Why does Sofia reject a file whose layers are named \"Rectangle 12\" and \"Frame 48\"?"
    options:
      - text: Figma slows down when layer names are not unique.
        why: Duplicate or default names do not affect performance. The cost is human and functional, not technical.
      - text: Default names hide the role of each layer, and features like smart animate and Dev Mode rely on meaningful names.
        why: Correct. Smart animate matches layers by name, developers read names in Dev Mode, and teammates navigate by them.
      - text: Developers cannot export layers that have default names.
        why: Export works regardless of the name. The problem is that nobody can tell what "Rectangle 12" is for.
    answer: 1
  - q: The floating add-habit button should stay 20 px from the bottom-right corner on every phone size. Which constraints do you set?
    options:
      - text: Left and Top.
        why: Those pin it to the top-left corner. On a larger screen it drifts away from the bottom-right.
      - text: Scale and Scale.
        why: Scale keeps proportional position and size, so the button would grow and move on larger screens.
      - text: Center and Center.
        why: Center keeps it a fixed offset from the middle, which is not the corner on a different screen size.
      - text: Right and Bottom.
        why: Correct. Right and Bottom keep the 20 px offsets from those two edges fixed while the frame resizes.
    answer: 3
---

Sofia's first review of every new designer's file starts in the layers panel, not on the canvas. She expands the tree and reads the names. If she sees `Group 7`, `Rectangle 12` and `Frame 48`, she knows the screen will fall apart the moment someone resizes it, prototypes it or hands it to a developer. The canvas can look perfect while the structure underneath is a pile.

This lesson is about that structure: the containers you put things in, the names you give them and the rules that keep them in place.

## Frames, groups and sections

Figma has three ways to bundle layers, and they are not interchangeable.

A **frame** is a container with a life of its own. It has a width and height you set, its own fill, stroke and corner radius, and an option to **Clip content** so children cannot spill outside. Only frames can have auto layout, layout guides, and children with constraints, and prototypes move between frames. Press `F` (or `A`) and drag to draw one, choose a phone size from the presets in the right sidebar, or select existing layers and press `Cmd+Option+G` (`Ctrl+Alt+G`) to wrap them in a frame.

A **group** (`Cmd+G` / `Ctrl+G`) is only a bundle. It has no fill of its own, and its size is whatever its children add up to. Move a child and the group's bounds change. That makes groups good for one thing: keeping a cluster of shapes together, such as the small trophy illustration on Steady's streak screen.

A **section** is a canvas organiser. You use sections to collect related screens, for example "Check-in flow", and later to mark a whole flow as ready for development (Lesson 4.3). Sections are not part of the UI itself.

:::tip When in doubt, frame it
If a layer bundle is part of the interface (a header, a row, a button, a card), make it a frame. You will want padding, a background or auto layout on it soon, and converting groups later is tedious.
:::

## Building the Today screen skeleton

Draw a 393 × 852 frame, a common size for current mid-size iPhones, and name it `Today`. Inside it, build three frames from top to bottom: `Header`, `Habit list` and `Tab bar`. Inside `Header`, add two text layers with the text tool (`T`): "Today" in the Large title style and the date in Subhead.

Text layers have a resizing mode that matters more than it looks. **Auto width** grows sideways as you type and suits short labels. **Auto height** keeps a fixed width and grows downward, which is right for anything that might wrap, such as habit names. **Fixed size** never changes and is how text gets cut off in other languages. Choose Auto height for habit names: "Meditate" fits on one line, but "Practise Spanish vocabulary for 15 minutes" does not.

Shapes come next. A rectangle (`R`) with a 12 px corner radius becomes a row background; an ellipse (`O`) becomes the check circle. Give every one of them a name by double-clicking it in the layers panel (or `Cmd+R` / `Ctrl+R` with the layer selected).

## Layers: order and names

The layers panel is a tree. Children are indented under their parent, and the order is the stacking order: whatever sits higher in the list is drawn on top. If the check circle disappears, it is usually below the row background in the list.

Name layers by **role**, not appearance: `Check button`, not `Teal circle`; `Streak`, not `Text 3`. The reasons are practical. Developers read these names in Dev Mode. Smart animate pairs layers between screens by name (Lesson 4.1). Component properties and overrides are easier to manage when the layers they touch are named. And a teammate opening your file at 11 pm before a release can find things.

:::mistake Fixing structure at the end
"I'll clean up the layers later" means renaming two hundred layers the night before handoff, and guessing what half of them were for. Name each layer when you create it; it takes two seconds then and twenty minutes later.
:::

## Constraints: what happens when the frame changes size

People use Steady on a 375-wide phone and on a 430-wide one. Constraints tell each child of a frame how to behave when that frame is resized. You set them in the **Constraints** controls of the right sidebar (in the Position section at the time of writing).

Horizontal options are **Left**, **Right**, **Left and right**, **Center** and **Scale**; vertical options mirror them with **Top**, **Bottom**, **Top and bottom**, **Center** and **Scale**. For Steady:

- `Header`: Left and right, Top. It stretches across and stays at the top.
- `Habit list`: Left and right, Top and bottom. It fills the space between header and tab bar.
- `Tab bar`: Left and right, Bottom. It always hugs the bottom edge.
- `Add button`: Right, Bottom. It keeps its 20 px offsets from that corner.

:::figure Constraints keep each part of the Today screen in place as the frame grows
<svg viewBox="0 0 680 330" role="img" aria-labelledby="t1">
  <title id="t1">Two phone frames, a narrow one and a wider, taller one. In both, the header stretches across the top, the tab bar stretches across the bottom, and the add button stays near the bottom-right corner.</title>
  <rect class="d-box" x="40" y="20" width="190" height="290" rx="18"/>
  <rect class="d-box-primary" x="40" y="20" width="190" height="44" rx="18"/>
  <text class="d-label" x="135" y="47" text-anchor="middle">Header</text>
  <rect class="d-box-accent" x="40" y="270" width="190" height="40" rx="0"/>
  <text class="d-label" x="135" y="295" text-anchor="middle">Tab bar</text>
  <circle class="d-dot" cx="204" cy="244" r="13"/>
  <text class="d-label-muted" x="135" y="160" text-anchor="middle">375 wide</text>
  <path class="d-arrow" d="M250 165 L300 165" marker-end="url(#arrow)"/>
  <rect class="d-box" x="320" y="10" width="250" height="310" rx="18"/>
  <rect class="d-box-primary" x="320" y="10" width="250" height="44" rx="18"/>
  <text class="d-label" x="445" y="37" text-anchor="middle">Header: L+R, Top</text>
  <rect class="d-box-accent" x="320" y="280" width="250" height="40" rx="0"/>
  <text class="d-label" x="445" y="305" text-anchor="middle">Tab bar: L+R, Bottom</text>
  <circle class="d-dot" cx="544" cy="254" r="13"/>
  <text class="d-label-muted" x="530" y="230" text-anchor="end">Add: Right, Bottom</text>
  <text class="d-label-muted" x="445" y="160" text-anchor="middle">430 wide</text>
</svg>
:::

Constraints apply to children of regular frames. Once a frame uses auto layout (next lesson), its children follow auto layout's resizing rules instead, and the Constraints controls are replaced by those settings.

Test before you move on. Select `Today` and drag its edge to make it narrower and taller. If anything floats in the middle, overlaps or gets cut off, its constraints are wrong. Return the frame to 393 × 852 when you are happy.

Next you replace most of this manual positioning with auto layout, which handles spacing and stacking for you.
