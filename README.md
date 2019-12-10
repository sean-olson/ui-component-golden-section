# Golden Section UI

A configurable ES6 module that generates a dynamic UI-layout grid based on the golden ratio ([see demo](https://sean-olson.github.io/golden-section-ui/)).

## Installation


  `npm i --save golden-section-ui`

## Basic Usage

Import the goldenSection class and constants object into your project using ES module syntax.

`import {goldenSection, GS} from 'golden-section-ui';`

### Generate a Grid

Call `goldenSection.generate({targetNodeId: "host-node-id"})`to generate a grid within the HTML element with the id, host-node-id.  You can additional options -- refer to the Generate Options list for specific options.

### Generate Options

- **targetNodeId** : REQUIRED, the parent node that will contain the Golden-Section layout.
  
- **orientation**: Use a GS.ORIENTATION constant to determine the position on the largest section in relation to the other sections with the layout grid.  Orientation also determines whether the major axis is vertical or horizontal.  It will also determine the direction of the long axis of the layout.
  
- **alignment**: Use a GS.ALIGN constant to determine how the layout is aligned horizontally within the containing element.
  
- **verticalAlignment**: Use a GS.VERTICAL_ALIGN constant to determine how the layout is aligned vertically within the containing element.
  
- **rotation**: Use a GS.ROTATION constant to determine the rotational direction of the layout.
  
- **sectionCount**: An integer value that sets the number of sections to be rendered, the maximum is 8.
  
- **sectionClasses**: An array of one or more class names to be applied to the rendered sections.  A class name is applied to a section in sequence to the sections being rendered, first element of styles array to the first section, second style to the second section and so on.  If there are fewer class names in the sectionClasses array than layout sections, the generator will cycle back through the array of class names, assigning them in sequence.
  
- **majorAxisMax**: An optional integer value that determines the maximum major-axis dimension of the golden-section layout.  Otherwise size constraints are hosted by the dimensions of the host HTML node. 
           
- **majorAxisMin**: An optional integer value that determines the minimum major-axis dimension of the golden-section layout.  Otherwise size constraints are hosted by the dimensions of the host HTML node.
            
- **cssTransition**:  An object setting with two properties: 
  - **duration**:  An optional millisecond value that maps to the transition-duration property -- default is 500.
  - **timing**: An optional property that maps to the transition-timing-function -- default is ease-out.
  
- **renderInterval**: An optional millisecond setting that controls the time interval between layout-section rendering.  By default, all sections render simultaneously.
  
- **resizeThrotleInterval**: An optional millisecond value that throttles the resize event. By default, it's set to 15ms.

### Constants

Use these constants for UI configuration.

    ORIENTATION: TOP | RIGHT | BOTTOM | LEFT

    ROTATION: CW | CCW

    ALIGN: LEFT | CENTER | RIGHT

    VERTICAL_ALIGN:  TOP | MIDDLE | BOTTOM


