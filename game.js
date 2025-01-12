const game = {
    boatPosition: 'left',
    boat: document.querySelector('.boat'),
    characters: {
        driver: { elem: document.querySelector('.driver'), position: 'left', inBoat: false },
        child: { elem: document.querySelector('.child'), position: 'left', inBoat: false },
        food: { elem: document.querySelector('.food'), position: 'left', inBoat: false },
        dog: { elem: document.querySelector('.dog'), position: 'left', inBoat: false }
    },
    moves: 0,
    startTime: Date.now(),
    gameStarted: false
};

const gridPositions = {
    left: {
        ground: [20, 80, 140, 200],
        boat: [60, 100]
    },
    right: {
        ground: [560, 620, 680, 740],
        boat: [580, 620]
    }
};

function updateStats() {
    if (!game.gameStarted) return;
    const time = Math.floor((Date.now() - game.startTime) / 1000);
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('moves').textContent = game.moves;
}

function showMessage(text, isError = true) {
    const message = document.querySelector('.message');
    message.textContent = text;
    message.style.display = 'block';
    message.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 128, 0, 0.8)';
    setTimeout(() => message.style.display = 'none', 3000);
}

function gameOver(message) {
    const overlay = document.querySelector('.game-over-overlay');
    const details = document.querySelector('.game-over-details');
    details.textContent = message;
    overlay.style.display = 'flex';
    game.gameStarted = false;
}

function restartGame() {
    Object.values(game.characters).forEach(char => {
        char.position = 'left';
        char.inBoat = false;
        char.elem.classList.remove('eaten', 'eating', 'in-boat');
        char.elem.classList.add('on-ground');
        char.elem.style.opacity = '1';
        char.elem.style.transform = 'none';
        updateCharacterPosition(char);
    });

    game.boatPosition = 'left';
    game.boat.style.left = '40px';

    game.moves = 0;
    game.startTime = Date.now();
    game.gameStarted = true;

    document.querySelector('.game-over-overlay').style.display = 'none';
    
    updateStats();
}

function animateViolation(victim, attacker, message) {
    victim.elem.classList.add('eaten');
    attacker.elem.classList.add('eating');
    setTimeout(() => {
        gameOver(message);
    }, 1000);
}

function checkViolations() {
    const leftBank = Object.entries(game.characters)
        .filter(([_, char]) => char.position === 'left' && !char.inBoat);
    const rightBank = Object.entries(game.characters)
        .filter(([_, char]) => char.position === 'right' && !char.inBoat);

    function checkBank(chars) {
        const charDict = Object.fromEntries(chars);
        
        if (charDict.child && charDict.dog && !charDict.driver) {
            animateViolation(
                game.characters.child,
                game.characters.dog,
                "The baby was eaten by the dog! 😱"
            );
            return false;
        }
        
        if (charDict.child && charDict.food && !charDict.driver) {
            animateViolation(
                game.characters.food,
                game.characters.child,
                "The baby ate the candy and got sick! 🤒"
            );
            return false;
        }
        
        return true;
    }

    return checkBank(leftBank) && checkBank(rightBank);
}

function checkWin() {
    const allOnRight = Object.values(game.characters)
        .every(char => char.position === 'right');
    if (allOnRight) {
        showMessage('Congratulations! You won! 🎉', false);
        return true;
    }
    return false;
}

function updateCharacterPosition(character) {
    const chars = Object.values(game.characters);
    if (character.inBoat) {
        character.elem.classList.remove('on-ground');
        character.elem.classList.add('in-boat');
        const boatIndex = chars.filter(c => c.inBoat).indexOf(character);
        const boatPositions = gridPositions[game.boatPosition].boat;
        character.elem.style.left = `${boatPositions[boatIndex]}px`;
    } else {
        character.elem.classList.remove('in-boat');
        character.elem.classList.add('on-ground');
        const bankChars = chars.filter(c => 
            c.position === character.position && !c.inBoat
        );
        const index = bankChars.indexOf(character);
        const positions = gridPositions[character.position].ground;
        character.elem.style.left = `${positions[index]}px`;
    }
}

function moveBoat() {
    if (!game.gameStarted) {
        game.gameStarted = true;
        game.startTime = Date.now();
    }

    const boatPassengers = Object.values(game.characters)
        .filter(char => char.inBoat);

    if (!boatPassengers.includes(game.characters.driver)) {
        showMessage('The boat needs a driver!');
        return;
    }

    if (boatPassengers.length > 2) {
        showMessage('Too many passengers in the boat!');
        return;
    }

    game.boatPosition = game.boatPosition === 'left' ? 'right' : 'left';
    game.boat.style.left = game.boatPosition === 'left' ? '40px' : '560px';

    boatPassengers.forEach(char => {
        char.position = game.boatPosition;
        updateCharacterPosition(char);
    });

    game.moves++;
    updateStats();
    if (!checkViolations()) {
        return;
    }

    checkWin();
}

function toggleCharacterInBoat(character) {
    if (!game.gameStarted) {
        game.gameStarted = true;
        game.startTime = Date.now();
    }

    if (character.position !== game.boatPosition) return;

    const boatPassengers = Object.values(game.characters)
        .filter(char => char.inBoat);

    if (!character.inBoat && boatPassengers.length >= 2) {
        showMessage('The boat is full!');
        return;
    }

    character.inBoat = !character.inBoat;
    updateCharacterPosition(character);
    
    Object.values(game.characters)
        .filter(char => char.position === character.position && !char.inBoat)
        .forEach(char => updateCharacterPosition(char));

    game.moves++;
    updateStats();
}

game.boat.addEventListener('click', moveBoat);
Object.values(game.characters).forEach(character => {
    character.elem.addEventListener('click', () => toggleCharacterInBoat(character));
});

document.querySelector('.restart-button').addEventListener('click', restartGame);

setInterval(updateStats, 1000);