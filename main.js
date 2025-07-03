document.addEventListener('DOMContentLoaded', function() {
    // Create stars background
    const starsContainer = document.getElementById('stars-container');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        starsContainer.appendChild(star);
    }
    
    // Create meteors
    for (let i = 0; i < 5; i++) {
        const meteor = document.createElement('div');
        meteor.classList.add('meteor');
        meteor.style.top = `${Math.random() * 100}%`;
        meteor.style.left = `${Math.random() * 100}%`;
        meteor.style.animationDelay = `${Math.random() * 10}s`;
        starsContainer.appendChild(meteor);
    }

    // Typing test functionality
    const typingText = document.getElementById('typing-text');
    const typingInput = document.getElementById('typing-input');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const wpmElement = document.getElementById('wpm');
    const accuracyElement = document.getElementById('accuracy');
    const timeElement = document.getElementById('time');
    const progressBar = document.getElementById('progress-bar');
    const cursor = document.getElementById('cursor');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const timerBtns = document.querySelectorAll('.timer-btn');
    const resultsModal = document.getElementById('results-modal');
    const resultWpm = document.getElementById('result-wpm');
    const resultAccuracy = document.getElementById('result-accuracy');
    const resultChars = document.getElementById('result-chars');
    const resultErrors = document.getElementById('result-errors');
    const saveScoreBtn = document.getElementById('save-score-btn');
    const closeResultsBtn = document.getElementById('close-results-btn');
    const usernameInput = document.getElementById('username-input');
    const leaderboardFilter = document.getElementById('leaderboard-filter');
    const refreshLeaderboardBtn = document.getElementById('refresh-leaderboard');
    const leaderboardContainer = document.getElementById('leaderboard');
    const emptyLeaderboard = document.getElementById('empty-leaderboard');
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const closeInfoBtn = document.getElementById('close-info-btn');
    const difficultyInfoBtn = document.getElementById('difficulty-info-btn');
    const timerInfoBtn = document.getElementById('timer-info-btn');

    // Text passages by difficulty
    const passages = {
        easy: [
            "The stars shine brightly in the night sky. Space exploration has always fascinated humanity. We look up and wonder what lies beyond our planet.",
            "Rockets launch into space with powerful engines. Astronauts train for years before their first mission. The view of Earth from orbit is breathtaking.",
            "The moon orbits around Earth every month. Its surface is covered with craters and dust. Humans first walked on the moon in 1969."
        ],
        medium: [
            "Interstellar travel remains a challenge for our current technology. Scientists theorize about wormholes and faster-than-light propulsion systems. The nearest star system, Alpha Centauri, is over four light-years away from Earth.",
            "The International Space Station orbits our planet at approximately 28,000 kilometers per hour. Astronauts conduct scientific experiments in the unique microgravity environment. Space agencies from multiple countries collaborate on this remarkable project.",
            "Mars has captured our imagination as a potential second home for humanity. Its reddish appearance comes from iron oxide on its surface. Robotic rovers explore the Martian landscape, searching for signs of ancient life."
        ],
        hard: [
            "Quantum entanglement suggests that particles can remain connected across vast distances in space. Einstein referred to this phenomenon as 'spooky action at a distance.' This property might someday enable instantaneous communication across the cosmos, revolutionizing our understanding of physics and information transfer.",
            "The event horizon of a black hole marks the boundary beyond which nothing can escape its gravitational pull. Stephen Hawking theorized that black holes slowly evaporate through a process now known as Hawking radiation. The first image of a black hole's shadow was captured by the Event Horizon Telescope in 2019.",
            "Exoplanetary atmospheres are studied through spectroscopic analysis when planets transit their host stars. Scientists look for biosignatures that might indicate the presence of life. The James Webb Space Telescope will dramatically enhance our ability to characterize these distant worlds."
        ],
        expert: [
            "The cosmological principle posits that the distribution of matter in the universe is homogeneous and isotropic when viewed on a sufficiently large scale. This fundamental assumption underpins the Lambda-CDM model, which incorporates dark energy and cold dark matter to explain the accelerating expansion of the universe observed through type Ia supernovae luminosity measurements.",
            "Quantum fluctuations during the inflationary epoch are theorized to be the primordial seeds of cosmic structure formation. These microscopic variations were amplified to macroscopic scales, eventually leading to the gravitational collapse that formed the first stars and galaxies. The cosmic microwave background radiation provides observational evidence for these initial density perturbations.",
            "Gravitational wave astronomy has opened an entirely new window into observing cosmic phenomena previously invisible to electromagnetic detection methods. Binary black hole mergers create ripples in spacetime that propagate at the speed of light. The LIGO and Virgo collaborations have detected dozens of these events, confirming a major prediction of Einstein's general theory of relativity."
        ]
    };

    let currentText = '';
    let typedText = '';
    let startTime;
    let timer;
    let testActive = false;
    let testCompleted = false;
    let currentDifficulty = 'easy';
    let totalChars = 0;
    let correctChars = 0;
    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let testDuration = 60; // in seconds (default)
    let leaderboard = [];

    // Initialize with random text
    function initializeTest() {
        const passageArray = passages[currentDifficulty];
        currentText = passageArray[Math.floor(Math.random() * passageArray.length)];
        typedText = '';
        currentWordIndex = 0;
        currentCharIndex = 0;
        totalChars = 0;
        correctChars = 0;
        testCompleted = false;
        
        // Display the text
        displayText();
        
        // Reset stats
        wpmElement.textContent = '0';
        accuracyElement.textContent = '0%';
        timeElement.textContent = formatTime(testDuration);
        progressBar.style.width = '0%';
        
        // Enable/disable elements
        typingInput.value = '';
        typingInput.disabled = true;
        startBtn.classList.remove('hidden');
        resetBtn.classList.add('hidden');
    }

    // Format time display (convert seconds to min:sec if needed)
    function formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }
    }

    // Display text with formatting
    function displayText() {
        typingText.innerHTML = '';
        const words = currentText.split(' ');
        
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.classList.add('word');
            
            [...word].forEach((char, charIndex) => {
                const charSpan = document.createElement('span');
                charSpan.textContent = char;
                
                // Add classes based on typing progress
                if (wordIndex < currentWordIndex || 
                    (wordIndex === currentWordIndex && charIndex < currentCharIndex)) {
                    if (typedText[totalChars + charIndex] === char) {
                        charSpan.classList.add('typed-correct');
                    } else {
                        charSpan.classList.add('typed-incorrect');
                    }
                } else if (wordIndex === currentWordIndex && charIndex === currentCharIndex) {
                    charSpan.classList.add('typed-current');
                    
                    // Position cursor
                    setTimeout(() => {
                        const rect = charSpan.getBoundingClientRect();
                        const parentRect = typingText.getBoundingClientRect();
                        cursor.style.left = `${rect.left - parentRect.left}px`;
                        cursor.style.top = `${rect.top - parentRect.top}px`;
                    }, 0);
                }
                
                wordSpan.appendChild(charSpan);
            });
            
            typingText.appendChild(wordSpan);
            
            // Add space between words
            if (wordIndex < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.textContent = ' ';
                typingText.appendChild(spaceSpan);
            }
        });
    }

    // Start the typing test
    function startTest() {
        testActive = true;
        testCompleted = false;
        startTime = new Date().getTime();
        
        // Enable input and focus
        typingInput.disabled = false;
        typingInput.focus();
        
        // Update UI
        startBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
        
        // Start timer
        timer = setInterval(() => {
            const currentTime = new Date().getTime();
            const elapsedTime = Math.floor((currentTime - startTime) / 1000);
            const remainingTime = testDuration - elapsedTime;
            
            if (remainingTime <= 0) {
                endTest();
            } else {
                timeElement.textContent = formatTime(remainingTime);
                progressBar.style.width = `${(elapsedTime / testDuration) * 100}%`;
            }
        }, 1000);
    }

    // End the typing test
    function endTest() {
        testActive = false;
        testCompleted = true;
        clearInterval(timer);
        
        // Calculate final stats
        const elapsedTime = (new Date().getTime() - startTime) / 1000;
        const minutes = elapsedTime / 60;
        const wpm = Math.round((typedText.length / 5) / minutes);
        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
        const errors = totalChars - correctChars;
        
        // Update results modal
        resultWpm.textContent = wpm;
        resultAccuracy.textContent = `${accuracy}%`;
        resultChars.textContent = totalChars;
        resultErrors.textContent = errors;
        
        // Show results modal
        resultsModal.classList.remove('hidden');
        usernameInput.focus();
        
        // Disable input
        typingInput.disabled = true;
    }

    // Reset the test
    function resetTest() {
        clearInterval(timer);
        testActive = false;
        initializeTest();
    }

    // Save score to leaderboard
    function saveScore() {
        const username = usernameInput.value.trim() || 'Anonymous Astronaut';
        const wpm = parseInt(resultWpm.textContent);
        const accuracy = parseInt(resultAccuracy.textContent);
        
        const newScore = {
            id: Date.now().toString(),
            username,
            wpm,
            accuracy,
            difficulty: currentDifficulty,
            duration: testDuration,
            timestamp: new Date().toISOString()
        };
        
        // Add to local leaderboard
        leaderboard.push(newScore);
        
        // Sort leaderboard by WPM (descending)
        leaderboard.sort((a, b) => b.wpm - a.wpm);
        
        // Save to localStorage
        localStorage.setItem('cosmicTypeLeaderboard', JSON.stringify(leaderboard));
        
        // Update leaderboard display
        displayLeaderboard();
        
        // Close modal
        resultsModal.classList.add('hidden');
        
        // Reset test
        resetTest();
    }

    // Display leaderboard
    function displayLeaderboard() {
        const filter = leaderboardFilter.value;
        leaderboardContainer.innerHTML = '';
        
        // Filter leaderboard based on selected difficulty
        const filteredLeaderboard = filter === 'all' 
            ? leaderboard 
            : leaderboard.filter(entry => entry.difficulty === filter);
        
        if (filteredLeaderboard.length === 0) {
            emptyLeaderboard.classList.remove('hidden');
        } else {
            emptyLeaderboard.classList.add('hidden');
            
            // Display top entries
            filteredLeaderboard.slice(0, 9).forEach((entry, index) => {
                const rankCard = document.createElement('div');
                rankCard.classList.add('rank-card', 'bg-white/5', 'rounded-lg', 'p-4', 'border', 'border-white/10');
                
                // Add medal for top 3
                let medalEmoji = '';
                if (index === 0) medalEmoji = '🥇 ';
                else if (index === 1) medalEmoji = '🥈 ';
                else if (index === 2) medalEmoji = '🥉 ';
                
                // Format difficulty name
                let difficultyName = '';
                switch(entry.difficulty) {
                    case 'easy': difficultyName = 'Novice'; break;
                    case 'medium': difficultyName = 'Pilot'; break;
                    case 'hard': difficultyName = 'Commander'; break;
                    case 'expert': difficultyName = 'Cosmic Master'; break;
                }
                
                // Format timestamp
                const date = new Date(entry.timestamp);
                const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                
                // Format duration
                const durationText = formatTime(entry.duration || 60);
                
                rankCard.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">${medalEmoji}${entry.username}</h3>
                        <span class="text-xs text-white/50">${formattedDate}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-2xl font-bold text-purple-400">${entry.wpm}</span>
                            <span class="text-white/70 text-sm">WPM</span>
                        </div>
                        <div class="text-right">
                            <span class="text-white/70 text-sm">Accuracy</span>
                            <span class="ml-1 text-indigo-400">${entry.accuracy}%</span>
                        </div>
                    </div>
                    <div class="mt-2 flex justify-between text-xs text-white/50">
                        <span class="px-2 py-1 rounded-full bg-white/10">${difficultyName}</span>
                        <span class="px-2 py-1 rounded-full bg-white/10">${durationText} test</span>
                    </div>
                `;
                
                leaderboardContainer.appendChild(rankCard);
            });
        }
    }

    // Load leaderboard from localStorage
    function loadLeaderboard() {
        const savedLeaderboard = localStorage.getItem('cosmicTypeLeaderboard');
        if (savedLeaderboard) {
            leaderboard = JSON.parse(savedLeaderboard);
        }
        displayLeaderboard();
    }

    // Event listeners
    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);
    saveScoreBtn.addEventListener('click', saveScore);
    closeResultsBtn.addEventListener('click', () => {
        resultsModal.classList.add('hidden');
        resetTest();
    });
    
    leaderboardFilter.addEventListener('change', displayLeaderboard);
    refreshLeaderboardBtn.addEventListener('click', displayLeaderboard);

    // Info modal
    infoBtn.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
    });
    
    closeInfoBtn.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });
    
    difficultyInfoBtn.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
    });
    
    timerInfoBtn.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
    });

    // Handle difficulty selection
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Only allow changing difficulty when test is not active
            if (!testActive) {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.difficulty;
                initializeTest();
            }
        });
    });

    // Handle timer selection
    timerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Only allow changing timer when test is not active
            if (!testActive) {
                timerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                testDuration = parseInt(btn.dataset.time);
                timeElement.textContent = formatTime(testDuration);
                initializeTest();
            }
        });
    });

    // Handle typing input
    typingInput.addEventListener('input', () => {
        if (!testActive || testCompleted) return;
        
        const inputValue = typingInput.value;
        const lastChar = inputValue.charAt(inputValue.length - 1);
        
        // Check if space was typed (word completed)
        if (lastChar === ' ') {
            const words = currentText.split(' ');
            const currentWord = words[currentWordIndex];
            const typedWord = inputValue.trim();
            
            // Update character counts
            for (let i = 0; i < typedWord.length; i++) {
                totalChars++;
                if (i < currentWord.length && typedWord[i] === currentWord[i]) {
                    correctChars++;
                }
            }
            
            // Move to next word
            currentWordIndex++;
            currentCharIndex = 0;
            typedText += typedWord + ' ';
            typingInput.value = '';
            
            // Check if test is complete
            if (currentWordIndex >= currentText.split(' ').length) {
                endTest();
                return;
            }
        } else {
            // Update current character index
            currentCharIndex = inputValue.length;
        }
        
        // Update display
        displayText();
        
        // Calculate and update stats
        const elapsedTime = (new Date().getTime() - startTime) / 1000;
        const minutes = elapsedTime / 60;
        const wpm = Math.round((typedText.length / 5) / minutes);
        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
        
        wpmElement.textContent = wpm;
        accuracyElement.textContent = `${accuracy}%`;
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === resultsModal) {
            resultsModal.classList.add('hidden');
            resetTest();
        }
        if (e.target === infoModal) {
            infoModal.classList.add('hidden');
        }
    });

    // Initialize
    initializeTest();
    loadLeaderboard();
});