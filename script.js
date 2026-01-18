document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dobInput = document.getElementById('dob');
    const expectInput = document.getElementById('expectancy');
    const generateBtn = document.getElementById('generate-btn');
    const exportBtn = document.getElementById('export-btn');
    const lifeGrid = document.getElementById('life-grid');
    const xAxis = document.getElementById('x-axis');
    const yAxis = document.getElementById('y-axis');
    const statsSection = document.getElementById('stats');
    const lifelineProgress = document.getElementById('lifeline-progress');
    const lifelineText = document.getElementById('lifeline-text');
    const tooltip = document.getElementById('custom-tooltip');

    // New Feedback Element
    const feedbackMsg = document.getElementById('feedback-message');

    // Donation Elements
    const donateBtn = document.getElementById('donate-btn');

    // Stats Interval Variable
    let statsInterval = null;

    // CONFIGURATION: REPLACE WITH YOUR REVTAG
    const REVOLUT_TAG = 'robertuvf';
    if (donateBtn) donateBtn.href = `https://revolut.me/${REVOLUT_TAG}`;

    // Custom Spinner Logic
    const btnMinus = document.getElementById('btn-minus');
    const btnPlus = document.getElementById('btn-plus');

    if (btnMinus && btnPlus) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(expectInput.value) || 0;
            if (val > 1) {
                expectInput.value = val - 1;
                generateCalendar();
            }
        });

        btnPlus.addEventListener('click', () => {
            let val = parseInt(expectInput.value) || 0;
            if (val < 150) {
                expectInput.value = val + 1;
                generateCalendar();
            }
        });
    }

    // Tooltip Logic
    const showTooltip = (e, text) => {
        if (!tooltip) return;
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';
    };

    const hideTooltip = () => {
        if (!tooltip) return;
        tooltip.style.display = 'none';
        tooltip.textContent = '';
    };

    const moveTooltip = (e) => {
        if (!tooltip) return;
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';
    };

    // Feedback Helpers
    function showFeedback(msg) {
        if (feedbackMsg) {
            feedbackMsg.textContent = msg;
            feedbackMsg.classList.add('visible');
        }
    }

    function clearFeedback() {
        if (feedbackMsg) {
            feedbackMsg.classList.remove('visible');
            setTimeout(() => {
                feedbackMsg.textContent = '';
            }, 300);
        }
    }

    // Set default date to 13 October 1989
    const defaultDob = new Date('1989-10-13');
    if (dobInput) dobInput.valueAsDate = defaultDob;

    // Generate button removed
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);

    // Dynamic Auto-Update Logic
    if (dobInput) {
        dobInput.addEventListener('change', generateCalendar);
        // Also listen for keyup to catch typing if user manually types date
        dobInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') generateCalendar();
        });
    }

    if (expectInput) {
        expectInput.addEventListener('change', generateCalendar);
        expectInput.addEventListener('input', generateCalendar); // Updates immediately while typing
        expectInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') generateCalendar();
        });
    }

    // Auto-generate on load
    generateCalendar();

    // Helper Functions
    function getISOWeek(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    function getWeeksInYear(year) {
        const d = new Date(year, 11, 31);
        const week = getISOWeek(d);
        return week === 1 ? 52 : week;
    }

    function getDateOfISOWeek(w, y) {
        const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
        const dow = simple.getUTCDay();
        const isoWeekStart = simple;
        if (dow <= 4)
            isoWeekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
        else
            isoWeekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
        return isoWeekStart;
    }

    // Main Generation Function
    function generateCalendar() {
        // console.log("Generating calendar..."); // Removed for production
        const dobVal = dobInput.value;
        const yearsVal = parseInt(expectInput.value);

        if (!dobVal || isNaN(yearsVal) || yearsVal <= 0) {
            // Silently return, do not alert
            return;
        }

        const dob = new Date(dobVal);
        const currentNow = new Date();
        const birthYear = dob.getFullYear();

        if (dob > currentNow) {
            showFeedback("Date of Birth cannot be in the future.");
            return;
        }

        // Check if expectancy is less than current age
        const ageInMs = currentNow - dob;
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);

        if (yearsVal < ageInYears) {
            showFeedback(`You are already ${Math.floor(ageInYears)} years old! Please enter a higher expected age.`);
            return;
        }

        // Valid input - clear any warnings
        clearFeedback();

        // Clear containers
        lifeGrid.innerHTML = '';
        xAxis.innerHTML = '';
        yAxis.innerHTML = '';

        // Generate X-axis labels (1-53)
        for (let i = 1; i <= 53; i++) {
            const label = document.createElement('span');
            label.textContent = i;
            xAxis.appendChild(label);
        }

        const fragment = document.createDocumentFragment();
        const yFragment = document.createDocumentFragment();

        let totalWeeksLived = 0;
        let totalWeeksLeft = 0;

        for (let yearOffset = 0; yearOffset <= yearsVal; yearOffset++) {
            const year = birthYear + yearOffset;
            const weeksInThisYear = getWeeksInYear(year);

            // Y-Axis Label
            const yearLabel = document.createElement('span');
            yearLabel.textContent = year;
            yFragment.appendChild(yearLabel);

            // Year Row
            const yearRow = document.createElement('div');
            yearRow.classList.add('year-row');

            // Weeks
            for (let week = 1; week <= 53; week++) {
                if (week > weeksInThisYear) continue;

                const weekBox = document.createElement('div');
                weekBox.classList.add('week-box');

                const weekStartDate = getDateOfISOWeek(week, year);
                // Fix: Cover full 7 days (end of Sunday)
                const weekEndDate = new Date(weekStartDate.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);

                // Calculate Death Date for post-death visualization
                const deathDate = new Date(dob);
                deathDate.setFullYear(deathDate.getFullYear() + yearsVal);

                let status = '';

                if (weekEndDate < dob) {
                    status = 'pre-birth';
                } else if (weekStartDate > deathDate) {
                    status = 'post-death'; // New status for weeks after expected death
                } else if (weekStartDate > currentNow) {
                    status = 'future';
                    totalWeeksLeft++;
                } else if (currentNow >= weekStartDate && currentNow <= weekEndDate) {
                    status = 'current';
                    totalWeeksLived++;
                } else {
                    status = 'past';
                    totalWeeksLived++;
                }

                weekBox.classList.add(status);
                weekBox.dataset.tooltip = `Year: ${year} • Week ${week} • ${status.charAt(0).toUpperCase() + status.slice(1)}`;

                weekBox.addEventListener('mouseenter', (e) => showTooltip(e, e.target.dataset.tooltip));
                weekBox.addEventListener('mousemove', moveTooltip);
                weekBox.addEventListener('mouseleave', hideTooltip);

                // Touch support for mobile tooltips
                weekBox.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    showTooltip(e.touches[0], e.target.dataset.tooltip);
                }, { passive: false });

                yearRow.appendChild(weekBox);
            }
            fragment.appendChild(yearRow);
        }

        lifeGrid.appendChild(fragment);
        yAxis.appendChild(yFragment);

        // Update UI Parts
        try {
            // Calculate precise weeks for summary (fix for "0 weeks" bug)
            const deathDate = new Date(dob);
            deathDate.setFullYear(deathDate.getFullYear() + yearsVal);

            const msLived = currentNow - dob;
            const msLeft = deathDate - currentNow;

            const weeksLivedPrecise = Math.floor(msLived / (7 * 24 * 60 * 60 * 1000));
            // Use floor to match the countdown (e.g. "38 weeks and 5 days" -> "38 weeks left")
            const weeksLeftPrecise = Math.floor(msLeft / (7 * 24 * 60 * 60 * 1000));

            updateLifeline(weeksLivedPrecise, weeksLeftPrecise);

            // Show stats section immediately
            if (statsSection) {
                statsSection.style.display = 'block';
                statsSection.style.visibility = 'visible';
                statsSection.style.opacity = '1';
            }

            startRealTimeStats(dob, yearsVal);
        } catch (e) {
            console.error("Error updating stats:", e);
        }
    }

    function startRealTimeStats(dob, expectedYears) {
        // Clear existing interval
        if (statsInterval) {
            clearInterval(statsInterval);
            statsInterval = null;
        }

        const update = () => {
            const now = new Date();
            const deathDate = new Date(dob);
            deathDate.setFullYear(deathDate.getFullYear() + expectedYears);

            try {
                // Time Lived
                const livedDiff = now - dob;
                renderTimeBlock('time-lived-display', livedDiff);

                // Time Left
                const leftDiff = deathDate - now;
                renderTimeBlock('time-left-display', leftDiff);
            } catch (e) {
                console.error("Error in stats update loop:", e);
                if (statsInterval) clearInterval(statsInterval);
            }
        };

        update(); // Initial call
        statsInterval = setInterval(update, 1000);
    }

    function renderTimeBlock(elementId, msdiff) {
        const container = document.getElementById(elementId);
        if (!container) return;

        // Handle negative triggers (e.g. death date passed)
        if (msdiff < 0) msdiff = 0;

        const secondsTotal = Math.floor(msdiff / 1000);

        const years = Math.floor(secondsTotal / 31557600);
        const weeks = Math.floor((secondsTotal % 31557600) / 604800);
        const days = Math.floor((secondsTotal % 604800) / 86400);
        const hours = Math.floor((secondsTotal % 86400) / 3600);
        const minutes = Math.floor((secondsTotal % 3600) / 60);
        const seconds = Math.floor(secondsTotal % 60);

        const units = [
            { val: years, label: 'Years' },
            { val: weeks, label: 'Weeks' },
            { val: days, label: 'Days' },
            { val: hours, label: 'Hours' },
            { val: minutes, label: 'Mins' },
            { val: seconds, label: 'Secs' }
        ];

        container.innerHTML = units.map(u => `
            <div class="time-unit">
                <span class="time-val">${u.val}</span>
                <span class="time-label">${u.label}</span>
            </div>
        `).join('');
    }

    function updateLifeline(lived, left) {
        if (!lifelineProgress || !lifelineText) return;

        const totalWeeks = lived + left;
        const percentage = totalWeeks > 0 ? ((lived / totalWeeks) * 100).toFixed(0) : 0; // Integer only

        setTimeout(() => {
            lifelineProgress.style.width = `${percentage}%`;
        }, 100);

        lifelineText.textContent = `${percentage}% Lived`;

        // Restore Summary Sentences
        const summaryDiv = document.getElementById('summary-sentences');
        if (summaryDiv) {
            summaryDiv.innerHTML = `
                <p>You have lived <strong>${lived.toLocaleString()}</strong> weeks. 
                You have <strong>${left.toLocaleString()}</strong> weeks left.</p>
            `;
        }
    }

    function exportToCSV() {
        const dobVal = dobInput.value;
        const yearsVal = parseInt(expectInput.value);

        if (!dobVal || isNaN(yearsVal) || yearsVal <= 0) {
            // Silently return
            return;
        }

        const dob = new Date(dobVal);
        const currentNow = new Date();
        const birthYear = dob.getFullYear();

        let csvContent = "data:text/csv;charset=utf-8,";
        let header = "Year";
        for (let i = 1; i <= 53; i++) {
            header += `,Week ${i}`;
        }
        csvContent += header + "\r\n";

        for (let yearOffset = 0; yearOffset < yearsVal; yearOffset++) {
            const year = birthYear + yearOffset;
            const weeksInThisYear = getWeeksInYear(year);
            let row = `${year}`;

            for (let week = 1; week <= 53; week++) {
                if (week > weeksInThisYear) {
                    row += ",";
                    continue;
                }

                const weekStartDate = getDateOfISOWeek(week, year);
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6);

                let status = '';

                if (weekEndDate < dob) {
                    status = 'Pre-birth';
                } else if (weekStartDate > currentNow) {
                    status = 'Future';
                } else if (currentNow >= weekStartDate && currentNow <= weekEndDate) {
                    status = 'Current';
                } else {
                    status = 'Past';
                }
                row += `,${status}`;
            }
            csvContent += row + "\r\n";
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);

        const todayStr = currentNow.toISOString().split('T')[0];
        link.setAttribute("download", `life_calendar_${dobVal}_generated_${todayStr}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
