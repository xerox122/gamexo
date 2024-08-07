const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultDiv = document.getElementById('result');
const backgroundMusic = document.getElementById('backgroundMusic');
const spinTune = document.getElementById('spinTune');
const sections = 5;  // Number of sections on the wheel
const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8633'];
const allPrizes = ["Dairy Milk Chocolate", "Smart Watch", "Leather File", "Button File", "5-Pic Pen"];
const displayPrizes = ["Dairy Milk Chocolate", "Smart Watch", "Leather File", "Button File", "5-Pic Pen"]; // Prizes to be displayed on the wheel
let currentAngle = 0;
let isSpinning = false;
let smartWatchWon = localStorage.getItem('smartWatchWon') === 'true';

// Start background music on page load
backgroundMusic.play();

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function ensureNoContiguousDuplicates(array) {
    const result = [];
    let lastItem = null;

    while (array.length) {
        const index = Math.floor(Math.random() * array.length);
        const item = array.splice(index, 1)[0];

        // Ensure no contiguous duplicates
        if (item !== lastItem) {
            result.push(item);
            lastItem = item;
        } else {
            // If the current item is the same as the last, try another item
            if (array.length) {
                const nextItem = array.splice(0, 1)[0];
                result.push(nextItem);
                lastItem = nextItem;
            }
        }
    }

    return result;
}

function drawWheel(prizes) {
    const prizeCount = sections;
    const sectionAngle = (2 * Math.PI) / prizeCount;

    for (let i = 0; i < prizeCount; i++) {
        const prize = prizes[i % prizes.length];  // Use modulo to wrap around the array
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.arc(200, 200, 200, i * sectionAngle, (i + 1) * sectionAngle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.closePath();
        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate((i + 0.5) * sectionAngle);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.font = '16px Arial';
        ctx.fillText(prize, 100, 10);
        ctx.restore();
    }
}

function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;

    // Pause background music and play spin sound effect
    backgroundMusic.pause();
    spinTune.play();

    let spinTime = 0;
    const spinTimeTotal = 3000; // Total spin duration in ms
    const easeOut = t => 1 - (--t) * t * t * t;

    // Remove "Smart Watch" from the prize options if it has been won
    const validPrizes = smartWatchWon ? allPrizes.filter(prize => prize !== "Smart Watch") : [...allPrizes];

    function rotate() {
        spinTime += 30;
        if (spinTime >= spinTimeTotal) {
            isSpinning = false;
            spinTune.pause();  // Pause the spin sound effect
            spinTune.currentTime = 0;  // Reset the spin sound effect to the start
            backgroundMusic.play();  // Resume background music

            // Select a random prize from the validPrizes array
            const winningIndex = Math.floor(Math.random() * validPrizes.length);
            const winningOutcome = validPrizes[winningIndex];
            resultDiv.textContent = `You won: ${winningOutcome}`;
            
            // Update localStorage if "Smart Watch" is won
            if (winningOutcome === "Smart Watch") {
                smartWatchWon = true;
                localStorage.setItem('smartWatchWon', 'true');
            }
            return;
        }
        const angleChange = (spinTimeTotal - spinTime) / spinTimeTotal * easeOut(spinTime / spinTimeTotal) * (2 * Math.PI / sections) + 6 * Math.PI;
        currentAngle += angleChange;
        ctx.clearRect(0, 0, 400, 400);
        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate(currentAngle);
        ctx.translate(-200, -200);
        drawWheel(displayPrizes);
        ctx.restore();
        requestAnimationFrame(rotate);
    }
    rotate();
}

drawWheel(displayPrizes);  // Initialize the wheel with the default prize list
spinButton.addEventListener('click', spinWheel);
