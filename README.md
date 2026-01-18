# Life Calendar (Zen Mode)

A beautiful, "Zen" web application to visualize your life in weeks. 
Based on the concept of "Memento Mori", it helps you appreciate the time you have lived and the time you have left.

## Features

- **Visual Grid**: Displays 52 weeks per row for every year of your life.
- **Auto-Calculated**: Input your DOB and everything updates instantly.
- **Zen Aesthetics**: Dark mode, calming teal/slate palette, and subtle "living" animations.
- **Smart Feedback**: 
    - Warns you if "Expected Years" is too low (< current age).
    - Calculates exact remaining time (weeks/days) without rounding errors.
- **Export**: Download your grid as a CSV file.
- **Privacy Focused**: No data is stored; everything runs locally in your browser.

## Setup & Usage

1.  **Clone/Download**: Ensure you have the full folder structure, including the `assets/` folder.
2.  **Open**: Simply open `index.html` in any modern web browser.
3.  **Interact**:
    - Enter your **Date of Birth**.
    - Adjust **Expected Years** (default is 70).
    - Hover over weeks to see specific dates.

## File Structure

```
/life_calendar
├── index.html      # Main structure
├── style.css       # All styles (Zen theme)
├── script.js       # Logic (Date calcs, Grid generation)
├── assets/         # Images and resources
│   └── zen_background.png
└── README.md       # This documentation
```

## Credits

- **Fonts**: [Lora](https://fonts.google.com/specimen/Lora) (Serif headers) & [Inter](https://fonts.google.com/specimen/Inter) (Body).
- **Icons**: Custom localized assets.
