# Canvas Template

A lightweight, reusable template for creating HTML5 Canvas animations and interactive graphics. This project provides utility functions and a boilerplate structure to kickstart your canvas projects.

## Utilities

### Available Functions in `utils.js`

#### `randomIntFromRange(min, max)`
Generates a random integer between min and max (inclusive).

**Usage:**
```javascript
const randomNum = randomIntFromRange(1, 100);
// Returns a random number between 1 and 100
```

**Parameters:**
- `min` (number) - Minimum value
- `max` (number) - Maximum value

**Returns:** Random integer between min and max

---

#### `randomColor(colors)`
Selects a random color from the provided color array.

**Usage:**
```javascript
const myColor = randomColor(color1);
// Returns a random color from the color1 array
```

**Parameters:**
- `colors` (array) - Array of color values (hex, rgb, etc.)

**Returns:** Randomly selected color string

---

#### `distance(x1, y1, x2, y2)`
Calculates the distance between two points using the Pythagorean theorem.

**Usage:**
```javascript
const dist = distance(0, 0, 100, 100);
// Returns approximately 141.42 (distance between points)
```

**Parameters:**
- `x1` (number) - X coordinate of first point
- `y1` (number) - Y coordinate of first point
- `x2` (number) - X coordinate of second point
- `y2` (number) - Y coordinate of second point

**Returns:** Distance between the two points (number)

---

### Available Color Arrays in `colorArrays.js`

#### `color1`
A soft pastel pink color palette:
```javascript
['#fe5d9f', '#f686bd', '#f4bbd3', '#f1e4f3', '#d6d2d2']
```

## How to Use Utils Functions

### Option 1: ES6 Module Syntax (Recommended)

**Step 1:** Convert `utils.js` to ES6 modules by replacing the CommonJS export:

In `src/utils/utils.js`, change the last line from:
```javascript
module.exports = { randomIntFromRange, randomColor, distance }
```

To:
```javascript
export { randomIntFromRange, randomColor, distance }
```

**Step 2:** Import in your `canvas.js`:

```javascript
import { randomIntFromRange, randomColor, distance } from './utils/utils.js';
import { color1 } from './utils/colorArrays.js';
```

**Step 3:** Update your HTML to use the module script type:

```html
<script type="module" src="canvas.js"></script>
```

**Step 4:** Use the functions in your code:

```javascript
class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = randomColor(color1);  // Use the imported function
    }

    update() {
        // Calculate distance to mouse for interactive effects
        const distToMouse = distance(this.x, this.y, mouse.x, mouse.y);
        if (distToMouse < 200) {
            // Do something when mouse is nearby
        }
        this.draw();
    }
}

// In init function:
function init() {
    for (let i = 0; i < 100; i++) {
        const radius = randomIntFromRange(5, 30);
        const circle = new Circle(
            randomIntFromRange(radius, canvas.width - radius),
            randomIntFromRange(radius, canvas.height - radius),
            radius
        );
    }
}
```

### Option 2: Webpack Bundler Setup

If you need more complex build setup, see the `gravity/canvas-boilerplate/` folder for a webpack configuration example.

## Getting Started

1. **Clone or copy this template** to start a new canvas project
2. **Edit `index.html`** - Change the title and meta information
3. **Edit `canvas.js`** - Build your animation or interactive graphic
4. **Add colors** - Define your own color arrays in `colorArrays.js` or use the existing ones
5. **Use utilities** - Leverage the helper functions to reduce boilerplate code

## Live Reload (Optional)

For development, you can use a simple HTTP server:

```bash
python -m http.server 8000
# or
npx http-server
```

Then open `http://localhost:8000/src/index.html` in your browser.

## Tips & Best Practices

- **Keep it modular** - Add new utility functions to `utils.js` for reusable logic
- **Organize colors** - Create new color arrays in `colorArrays.js` for different themes
- **Performance** - Use `requestAnimationFrame()` for smooth animations (already included)
- **Responsive design** - The resize event listener keeps the canvas full-screen

## Common Use Cases

### Creating a particle effect
```javascript
class Particle extends Circle {
    constructor(x, y, radius, color, velocityX, velocityY) {
        super(x, y, radius, color);
        this.vx = velocityX;
        this.vy = velocityY;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.draw();
    }
}
```

### Interactive mouse detection
```javascript
function update() {
    circles.forEach(circle => {
        const d = distance(circle.x, circle.y, mouse.x, mouse.y);
        if (d < 100) {
            circle.color = '#ff0000'; // Highlight on hover
        }
    });
}
```