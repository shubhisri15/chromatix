import { palettes } from '/palettes.js'
import { moods } from '/moods.js'

const hexContainer = document.getElementById('hex-container')
const paletteSelectDropdown = document.getElementById('palette')
const moodSelectDropdown = document.getElementById('mood')
const colorForm = document.getElementById('color-form')

let isGenerating = false;

// Main rendering of colors within the hex container acc to selected options
colorForm.addEventListener('submit', async function(e) {
    e.preventDefault()
    if (isGenerating) return;
    isGenerating = true;
    
    const formData = new FormData(e.target)
    let { seedColor, palette, mood } = Object.fromEntries(formData.entries())
    seedColor = seedColor.replace('#', '')
    
    try {
        // even if palette is not chosen the Color API will return colors 
        const paletteColors = await fetchPaletteColors(seedColor, palette)  
        if (mood) {
            const moodColorResponse = await fetch('/.netlify/functions/fetchMoodColors', {
                  method: 'POST',
                  body: JSON.stringify({ colorsArray: paletteColors, mood })
            });
            const moodColors = await moodColorResponse.json();
            renderColors(moodColors)
        }
        renderColors(getRandomColors(paletteColors))
    } catch (error) {
        console.log('Error: ', error)
    } finally {
        isGenerating = false
    }
})

// clicking on any of the hexes should copy the hex-code to clipboard
hexContainer.addEventListener('click', function(e) {
    if (e.target.dataset.hex) {
        const hexDiv = document.getElementById(e.target.id);
        const hexText = hexDiv.querySelector("p"); // get the <p> with the hex code
        const originalText = hexText.textContent;

        copyToClipboard(originalText.trim());

        hexText.textContent = "Copied!";
        setTimeout(() => {
            hexText.textContent = originalText;
        }, 1000);
    }
});

// renders final colors on the screen
function renderColors(colors) {
    const hexDivs = hexContainer.querySelectorAll(".hex")
    hexDivs.forEach((div, index) => {
        const color = colors[index]
        div.style.backgroundColor = color
        div.querySelector("p").textContent = color
        applyContrastColorToHexText(div.id, color)
    })
}

// fetches colors according to chosen palette
async function fetchPaletteColors(seedColor, paletteType) {
    const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${seedColor}&count=19&mode=${paletteType}`)
    const data = await response.json()
    return data.colors.map(color => color.hex.value);
}

function applyContrastColorToHexText(divId) {
    const div = document.getElementById(divId);
    const bgColor = div.style.backgroundColor;

    const bestTextColor = tinycolor(bgColor).isLight() ? "#000" : "#fff";
    div.style.color = bestTextColor;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

function renderDropdownOptions(dropdown, options) {
    let optionsHtml = ``
    options.forEach(option => {
        optionsHtml += `<option value='${option}'>${option}</option>`
    })
    dropdown.innerHTML += optionsHtml
}

function getRandomColors(colorsArray, count = 5) {
    const shuffled = [...colorsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

renderDropdownOptions(paletteSelectDropdown, palettes)
renderDropdownOptions(moodSelectDropdown, moods)
