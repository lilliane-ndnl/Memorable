# Logo Instructions for Memorable App

## Logo Specifications

The Memorable app requires a 3D rendered logo with the following characteristics:

- **App Name**: Memorable
- **Font**: Roboto, thick/bold weight
- **Color**: #dc88f7 (purple/lavender)
- **3D Effects**:
  - Light environment: dawn
  - Bevel: large
  - Material: metallic

## Implementation Instructions

1. **Create the 3D Logo**:
   - Use a 3D rendering tool like Blender, Cinema 4D, or online tools like Canva Pro
   - Create text with the word "Memorable" using Roboto font
   - Apply purple/lavender color (#dc88f7)
   - Add large bevel effect
   - Apply metallic material
   - Set light environment to dawn (soft morning light)
   - Render with transparent background

2. **Save the Logo**:
   - Export as PNG with transparent background
   - Save to: `CollegeCalendar/assets/images/logo.png`
   - Recommended dimensions: 320px width × 64px height

3. **Replace Text with Image**:
   - Once the logo image is created, update the AppHeader.js file:
   - Uncomment the Image component
   - Comment out or remove the Text component

## Example Implementation in AppHeader.js

```javascript
// Replace this:
<Text style={styles.logoText}>Memorable</Text>

// With this:
<Image
  source={require('../assets/images/logo.png')}
  style={styles.logo}
  resizeMode="contain"
/>
```

## Design Notes

- The logo should be clearly visible against both light and dark backgrounds
- The 3D effect should be subtle enough to maintain readability
- The metallic material should give a premium feel
- Ensure the logo is responsive and displays well on different screen sizes 