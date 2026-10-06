# Display Sensei

<img src="icon.png" width="64" alt="Display Sensei icon">

A Blockbench plugin for Minecraft: Bedrock Edition. It sets how your models display in the game:

- **Blocks:** held in first and third person, in item frames, on the ground, on shelves, in flower pots, in the inventory and on the head.
- **3D items (attachables):** how they sit in the main hand and the off hand, in first and third person, written into the pack's hold animation.
- **Armor and other worn items:** on players, armor stands and mobs, with a fit check, bone and pivot fixes, and pose tests.
- **Your pack:** the pack files of the open model (blocks, items, armor, mobs), with or without Blockbench's Item, Block and Entity Wizards.

For Bedrock, Blockbench's own Display Mode only covers block models. Display Sensei shows everything on Bedrock reference models and poses, and matches first person to third person.

## Usage

Open a Bedrock Block or Bedrock Entity project, then choose **Tools > Display Sensei**.

- **Hand:** blocks and 3D items in the hand.
- **World, Inventory:** blocks in the other display places.
- **Armor:** worn pieces on their wearers.
- **Output:** the geometry, your pack's files, and Write display for the holds of 3D items.

### World

![World tab: Ground, Item Frame, Shelf and Flower Pot](images/world.png)

### Inventory

![Inventory tab: GUI](images/inventory.png)

### Armor

![Armor tab: a chest piece on the player](images/armor.png)

### Output

![Output tab: the pack files and the geometry output](images/output.png)

## Install

Needs Blockbench 5.2 or newer. Drag `display_sensei.js` into Blockbench, or choose **File > Plugins...** and **Load Plugin from File**.

## Build

With Node.js, `node build.js` writes `display_sensei.js` from `src/`, `lang/` and `icon.png`.

## License

MIT. See [LICENSE](LICENSE).
