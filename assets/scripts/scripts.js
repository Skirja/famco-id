document.addEventListener('DOMContentLoaded', function () {
    const monthYearElement = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid-new');
    const calendarGridView = document.getElementById('calendar-grid-view');
    const calendarListView = document.getElementById('calendar-list-view');
    const todayBtn = document.getElementById('today-btn');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const monthViewBtn = document.getElementById('month-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const eventDetailsContent = document.getElementById('event-details-content');
    const eventListItems = document.querySelectorAll('.event-list-item');

    // Mobile view switch elements
    const mobileViewSwitchBtn = document.getElementById('mobile-view-switch-btn');
    const viewSwitchDropdown = document.getElementById('view-switch-dropdown');
    const mobileMonthViewBtn = document.getElementById('mobile-month-view-btn');
    const mobileListViewBtn = document.getElementById('mobile-list-view-btn');

    // Get current year and month for realistic events
    const realToday = new Date();
    const realYear = realToday.getFullYear();
    const realMonth = realToday.getMonth();
    const nextMonth = (realMonth + 1) % 12;
    const nextMonthYear = realMonth === 11 ? realYear + 1 : realYear;

    // --- Enhanced Event Data ---
    // Keys match data-event-key in the event list
    // Values are objects where keys are YYYY-MM-DD and values are event details
    const allEvents = {
        'islamic': {
            [`${realYear}-${String(realMonth + 1).padStart(2, '0')}-15`]: { time: '10:00', title: 'Islamic Family Values', desc: 'Learn about Islamic family values with Ustadz Ahmad.', quota: 20, registered: 15 },
            [`${realYear}-${String(nextMonth + 1).padStart(2, '0')}-10`]: { time: '14:00', title: 'Islamic Parenting', desc: 'Raising children with Islamic principles and values.', quota: 25, registered: 5 }
        },
        'parenting': {
            [`${realYear}-${String(realMonth + 1).padStart(2, '0')}-19`]: { time: '12:00', title: 'Effective Parenting', desc: 'Learn effective parenting techniques with Dr. Maya.', quota: 10, registered: 8 },
            [`${realYear}-${String(realMonth + 1).padStart(2, '0')}-20`]: { time: '09:00', title: 'Parenting for Teenagers', desc: 'Special session on parenting teenagers.', quota: 10, registered: 5 },
            [`${realYear}-${String(nextMonth + 1).padStart(2, '0')}-15`]: { time: '08:00', title: 'Early Childhood Parenting', desc: 'Parenting techniques for children ages 0-5.', quota: 15, registered: 2 }
        },
        'food': {
            [`${realYear}-${String(realMonth + 1).padStart(2, '0')}-25`]: { time: '13:00', title: 'Healthy Family Meals', desc: 'Learn to prepare nutritious meals for your family.', quota: 50, registered: 30 },
            [`${realYear}-${String(nextMonth + 1).padStart(2, '0')}-05`]: { time: '10:00', title: 'Nutrition for Children', desc: 'Understanding nutritional needs for growing children.', quota: 40, registered: 12 }
        },
        'creativity': {
            [`${realYear}-${String(realMonth + 1).padStart(2, '0')}-05`]: { time: '16:00', title: 'Art for Children', desc: 'Creative art activities to develop children\'s imagination.', quota: 15, registered: 8 },
            [`${realYear}-${String(realMonth + 1).padStart(2, '0')}-12`]: { time: '16:00', title: 'Music & Movement', desc: 'Exploring creativity through music and movement for children.', quota: 15, registered: 14 }
        },
        'pranikah': {
            [`${realYear}-${String(realMonth + 1).padStart(2, '0')}-07`]: { time: '18:30', title: 'Persiapan Pranikah', desc: 'Kelas persiapan untuk calon pengantin.', quota: 30, registered: 25 },
            [`${realYear}-${String(realMonth + 1).padStart(2, '0')}-21`]: { time: '18:30', title: 'Keuangan Pranikah', desc: 'Mengelola keuangan sebelum dan sesudah menikah.', quota: 30, registered: 10 }
        }
    };

    // --- Global State ---
    let currentDate = new Date();
    let currentFilterKey = null; // Which event type is selected
    let currentView = 'month'; // 'month' or 'list'

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthNamesID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    // --- Helper Functions ---
    // Get all events for a specific date
    function getEventsForDate(year, month, day) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let dateEvents = [];

        for (const eventKey in allEvents) {
            if (!currentFilterKey || currentFilterKey === eventKey) { // Apply filter
                if (allEvents[eventKey][dateStr]) {
                    dateEvents.push({
                        ...allEvents[eventKey][dateStr],
                        type: eventKey
                    });
                }
            }
        }

        return dateEvents;
    }

    // Format a date as a readable string
    function formatDateString(year, month, day) {
        const date = new Date(year, month, day);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }

    // Show modal with events for the selected date
    function showEventDetails(year, month, day, events) {
        const modal = document.getElementById('event-details-modal');
        const modalDate = document.getElementById('modal-date');
        const eventsContainer = document.getElementById('modal-events-container');

        // Set the date in the modal header
        const formattedDate = formatDateString(year, month, day);
        modalDate.textContent = formattedDate;

        // Clear previous events
        eventsContainer.innerHTML = '';

        if (events.length === 0) {
            eventsContainer.innerHTML = '<p class="text-center text-gray-500 my-4">Tidak ada event pada tanggal ini</p>';
        } else {
            // Add each event to the modal
            events.forEach(event => {
                const eventKey = `${event.type}-${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const eventHTML = `
                            <div class="event-item">
                                <div class="flex items-center mb-2">
                                    <span class="event-type-indicator" style="background-color: ${getEventTypeColor(event.type)}"></span>
                                    <h4 class="font-semibold">${event.title}</h4>
                                </div>
                                <div class="ml-5">
                                    <p class="text-gray-700"><strong>Waktu:</strong> ${event.time}</p>
                                    <p class="text-gray-700 mt-2">${event.desc}</p>
                                    <button class="modal-register-btn bg-warm-orange text-white px-4 py-2 rounded-full text-sm mt-3 hover:bg-opacity-90 transition-all duration-300" data-event-id="${eventKey}">Daftar Event</button>
                                </div>
                            </div>
                        `;
                eventsContainer.innerHTML += eventHTML;
            });

            // Add event listeners to modal register buttons
            eventsContainer.querySelectorAll('.modal-register-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const eventId = this.getAttribute('data-event-id');
                    document.getElementById('event-details-modal').style.display = 'none'; // Close modal
                    scrollToForm(eventId);
                });
            });
        }

        // Show the modal
        modal.style.display = 'flex';
    }

    // Get the color for an event type
    function getEventTypeColor(type) {
        const colorMap = {
            'islamic': '#FF9F87',
            'parenting': '#8B72BE',
            'food': '#F3B562',
            'creativity': '#52B788',
            'pranikah': '#4EA8DE'
        };

        return colorMap[type] || '#E8927C';
    }

    // Switch between month and list views
    function switchView(view) {
        currentView = view;

        if (view === 'month') {
            monthViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            calendarGridView.style.display = 'block';
            calendarListView.style.display = 'none';
        } else {
            monthViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
            calendarGridView.style.display = 'none';
            calendarListView.style.display = 'block';
        }

        // Update mobile dropdown active state
        if (view === 'month') {
            mobileMonthViewBtn.classList.add('active');
            mobileListViewBtn.classList.remove('active');
        } else {
            mobileMonthViewBtn.classList.remove('active');
            mobileListViewBtn.classList.add('active');
        }

        // Update calendar content based on current view
        updateCalendar();
    }

    // Get all events for current month or next few months (for list view)
    function getEventsForPeriod(startYear, startMonth, monthsAhead = 3) {
        let allPeriodEvents = [];

        for (let i = 0; i < monthsAhead; i++) {
            let year = startYear;
            let month = startMonth + i;

            // Adjust year if needed
            if (month > 11) {
                year += Math.floor(month / 12);
                month = month % 12;
            }

            // Get events for this month
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                // Check each event type
                for (const eventKey in allEvents) {
                    if (!currentFilterKey || currentFilterKey === eventKey) {
                        if (allEvents[eventKey][dateStr]) {
                            allPeriodEvents.push({
                                ...allEvents[eventKey][dateStr],
                                type: eventKey,
                                year: year,
                                month: month,
                                day: day,
                                dateStr: dateStr
                            });
                        }
                    }
                }
            }
        }

        // Sort events by date
        allPeriodEvents.sort((a, b) => {
            return new Date(a.year, a.month, a.day) - new Date(b.year, b.month, b.day);
        });

        return allPeriodEvents;
    }

    // Render the list view
    function renderListView(year, month) {
        calendarListView.innerHTML = '';

        // Get events for next 3 months
        const events = getEventsForPeriod(year, month);

        if (events.length === 0) {
            calendarListView.innerHTML = '<p class="text-center text-gray-500 my-8">Tidak ada event yang dijadwalkan dalam 3 bulan ke depan</p>';
            return;
        }

        // Group events by month
        const eventsByMonth = {};

        events.forEach(event => {
            const monthKey = `${event.year}-${event.month}`;
            if (!eventsByMonth[monthKey]) {
                eventsByMonth[monthKey] = [];
            }
            eventsByMonth[monthKey].push(event);
        });

        // Create month sections
        for (const monthKey in eventsByMonth) {
            const [year, month] = monthKey.split('-').map(Number);
            const monthHeader = document.createElement('div');
            monthHeader.className = 'month-header';
            monthHeader.textContent = `${monthNamesID[month]} ${year}`;
            calendarListView.appendChild(monthHeader);

            // Add events for this month
            eventsByMonth[monthKey].forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'list-event-item';
                eventItem.innerHTML = `
                            <div class="list-date">
                                <div class="list-date-day">${event.day}</div>
                                <div class="list-date-month">${monthNamesShort[event.month]}</div>
                            </div>
                            <div class="flex-grow">
                                <div class="flex items-center">
                                    <span class="list-event-type" style="background-color: ${getEventTypeColor(event.type)}"></span>
                                    <span class="font-medium">${event.title}</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">${event.time} WIB</div>
                            </div>
                        `;

                // Add click event to show details
                eventItem.addEventListener('click', () => {
                    showEventDetails(event.year, event.month, event.day, [event]);
                });

                calendarListView.appendChild(eventItem);
            });
        }
    }

    // --- Calendar Rendering Function ---
    function renderCalendar(year, month) { // month is 0-11
        monthYearElement.textContent = `${monthNamesID[month]} ${year}`;
        calendarGrid.innerHTML = ''; // Clear previous grid

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 6=Sat
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let date = 1;
        let nextMonthDate = 1;

        // Calculate starting day of the previous month to display
        let prevMonthStartDate = daysInPrevMonth - firstDayOfMonth + 1;

        for (let i = 0; i < 6; i++) { // Max 6 weeks
            for (let j = 0; j < 7; j++) { // 7 days a week
                let cellClasses = 'day-cell';
                let daySpan = '';
                let eventsHTML = '';
                let isCurrentMonthDay = false;
                let currentDay = null;
                let currentYear = year;
                let currentMonth = month;
                let dateEvents = [];

                if (i === 0 && j < firstDayOfMonth) {
                    // Previous month's days
                    cellClasses += ' other-month';
                    currentDay = prevMonthStartDate;
                    daySpan = `<span>${currentDay}</span>`;

                    // Adjust month/year for previous month
                    if (month === 0) {
                        currentMonth = 11;
                        currentYear = year - 1;
                    } else {
                        currentMonth = month - 1;
                    }

                    prevMonthStartDate++;
                } else if (date > daysInMonth) {
                    // Next month's days
                    cellClasses += ' other-month';
                    currentDay = nextMonthDate;
                    daySpan = `<span>${currentDay}</span>`;

                    // Adjust month/year for next month
                    if (month === 11) {
                        currentMonth = 0;
                        currentYear = year + 1;
                    } else {
                        currentMonth = month + 1;
                    }

                    nextMonthDate++;
                } else {
                    // Current month's days
                    isCurrentMonthDay = true;
                    currentDay = date;
                    daySpan = `<span>${currentDay}</span>`;

                    const today = new Date();
                    if (currentDay === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                        cellClasses += ' today';
                    }

                    date++;
                }

                // Get events for this date
                dateEvents = getEventsForDate(currentYear, currentMonth, currentDay);

                // Add has-event class if there are events
                if (dateEvents.length > 0) {
                    cellClasses += ' has-event';
                    if (currentFilterKey) {
                        cellClasses += ' highlight';
                    }

                    // Add event count if multiple events
                    const countBadge = dateEvents.length > 1 ?
                        `<div class="event-count">${dateEvents.length}</div>` : '';

                    // Only show first event in cell, the rest will appear in tooltip
                    if (dateEvents.length > 0) {
                        const mainEvent = dateEvents[0];
                        let tooltipContent = '<div class="p-1">';

                        // Add all events to tooltip
                        dateEvents.forEach(evt => {
                            tooltipContent += `<div class="mb-1"><b>${evt.time}:</b> ${evt.title}</div>`;
                        });
                        tooltipContent += '</div>';

                        eventsHTML = `
                                    <div class="tooltip event-text">
                                        <span class="event-dot ${mainEvent.type}"></span> ${mainEvent.time} ${mainEvent.title}
                                        <span class="tooltiptext tooltiptext-event">${tooltipContent}</span>
                                    </div>
                                    ${countBadge}
                                `;
                    }
                }

                calendarGrid.innerHTML += `<div class="${cellClasses}" data-year="${currentYear}" data-month="${currentMonth}" data-day="${currentDay}">${daySpan}${eventsHTML}</div>`;
            }

            // Logic to determine if we need more rows
            if (date > daysInMonth && i < 5) {
                const totalCellsNeeded = firstDayOfMonth + daysInMonth;
                // Stop if we've filled all days and don't need another row
                if (i >= 4 || totalCellsNeeded <= (i + 1) * 7) break;
            }
        }

        // Add click event listeners to day cells
        const dayCells = calendarGrid.querySelectorAll('.day-cell');
        dayCells.forEach(cell => {
            cell.addEventListener('click', function () {
                const year = parseInt(this.getAttribute('data-year'));
                const month = parseInt(this.getAttribute('data-month'));
                const day = parseInt(this.getAttribute('data-day'));

                const events = getEventsForDate(year, month, day);
                showEventDetails(year, month, day, events);
            });
        });
    }

    // Update calendar based on current view
    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearElement.textContent = `${monthNamesID[month]} ${year}`;

        if (currentView === 'month') {
            renderCalendar(year, month);
        } else {
            renderListView(year, month);
        }
    }

    // --- Event Listeners ---
    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        updateCalendar();
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    // View switching
    monthViewBtn.addEventListener('click', () => {
        switchView('month');
    });

    listViewBtn.addEventListener('click', () => {
        switchView('list');
    });

    // Event List Item Click
    eventListItems.forEach(item => {
        item.addEventListener('click', () => {
            const selectedKey = item.getAttribute('data-event-key');

            // Toggle filter
            if (currentFilterKey === selectedKey) {
                currentFilterKey = null; // Deselect
                item.classList.remove('selected');
                eventDetailsContent.textContent = 'Select an event to see details';
            } else {
                eventListItems.forEach(el => el.classList.remove('selected')); // Deselect others
                item.classList.add('selected');
                currentFilterKey = selectedKey;

                // Display details about this event type
                let eventSummary = '';
                let eventCount = 0;

                // Count upcoming events of this type
                if (allEvents[selectedKey]) {
                    for (const dateKey in allEvents[selectedKey]) {
                        eventCount++;
                        // If this is the first one, use its description
                        if (eventCount === 1) {
                            const evt = allEvents[selectedKey][dateKey];
                            eventSummary = `${evt.desc} (${evt.time})`;
                        }
                    }
                }

                if (eventCount > 0) {
                    eventDetailsContent.innerHTML = `
                                <strong>${eventCount} upcoming event${eventCount > 1 ? 's' : ''}</strong><br>
                                ${eventSummary}
                            `;
                } else {
                    eventDetailsContent.textContent = `No upcoming ${item.textContent} scheduled.`;
                }
            }

            // Re-render calendar with the filter applied/removed
            updateCalendar();
        });
    });

    // Close modal when clicking the close button or outside the modal content
    document.getElementById('close-modal').addEventListener('click', function () {
        document.getElementById('event-details-modal').style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    document.getElementById('event-details-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // Scroll to form and optionally select event
    function scrollToForm(eventId = null) {
        const formSection = document.getElementById('form-pendaftaran');

        // Check if form section exists
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });

            if (eventId) {
                const selectEvent = document.getElementById('select-event');
                if (selectEvent) {
                    selectEvent.value = eventId;
                    // Trigger change event to update quota info
                    selectEvent.dispatchEvent(new Event('change'));
                }
            }
        } else {
            // If form section doesn't exist, scroll to registration section instead
            const registrationSection = document.getElementById('registrasi');
            if (registrationSection) {
                registrationSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    // --- Initial Render ---
    updateCalendar();

    // Populate Event Select Dropdown
    const selectEventDropdown = document.getElementById('select-event');

    // Only proceed if the select-event element exists
    if (selectEventDropdown) {
        const allSpecificEvents = [];
        for (const type in allEvents) {
            for (const date in allEvents[type]) {
                allSpecificEvents.push({
                    id: `${type}-${date}`,
                    title: `${allEvents[type][date].title} (${date})`,
                    quota: allEvents[type][date].quota,
                    registered: allEvents[type][date].registered
                });
            }
        }
        // Sort events for dropdown
        allSpecificEvents.sort((a, b) => new Date(a.id.split('-')[1]) - new Date(b.id.split('-')[1]));

        allSpecificEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.title;
            option.dataset.quota = event.quota;
            option.dataset.registered = event.registered;
            selectEventDropdown.appendChild(option);
        });

        // Add listener to update quota info
        const quotaInfoDiv = document.getElementById('quota-info');
        const remainingQuotaSpan = document.getElementById('remaining-quota');

        if (quotaInfoDiv && remainingQuotaSpan) {
            selectEventDropdown.addEventListener('change', function () {
                const selectedOption = this.options[this.selectedIndex];
                if (selectedOption.value) {
                    const quota = parseInt(selectedOption.dataset.quota);
                    const registered = parseInt(selectedOption.dataset.registered);
                    const remaining = quota - registered;

                    remainingQuotaSpan.textContent = `${remaining} dari ${quota}`;
                    quotaInfoDiv.className = 'quota-info'; // Reset class

                    if (remaining <= 0) {
                        remainingQuotaSpan.textContent += ' (Penuh)';
                        quotaInfoDiv.classList.add('full');
                    } else if (remaining <= 5) {
                        remainingQuotaSpan.textContent += ' (Segera Habis!)';
                        quotaInfoDiv.classList.add('warning');
                    }

                    quotaInfoDiv.style.display = 'block';
                } else {
                    quotaInfoDiv.style.display = 'none';
                }
            });
        }
    }

    // Handle form submission (optional - basic prevention)
    document.getElementById('registration-form').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Pendaftaran Terkirim! (Fungsi backend tidak diimplementasikan)');
        // Here you would typically send data to a server
    });

    // QnA Section Functionality
    document.addEventListener('DOMContentLoaded', function () {
        // Animate the question cards on scroll
        const questionCards = document.querySelectorAll('.question-card');

        // Simple animation on scroll
        function checkCardVisibility() {
            questionCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const isVisible = (rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0);

                if (isVisible) {
                    // Add a staggered delay based on card index
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 150);
                }
            });
        }

        // Initialize opacity and transform for animation
        questionCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        // Check on scroll and initial load
        window.addEventListener('scroll', checkCardVisibility);
        checkCardVisibility();

        // Question card click interaction
        questionCards.forEach(card => {
            card.addEventListener('click', function () {
                // Highlight the selected card
                questionCards.forEach(c => c.classList.remove('selected-question'));
                this.classList.add('selected-question');

                // In a real implementation, this would show the answer or navigate to answer page
                const question = this.querySelector('h3').textContent;
                alert(`Pertanyaan: ${question}\n\nJawaban akan segera ditampilkan.`);
            });
        });

        // See more button functionality
        const seeMoreBtn = document.querySelector('.see-more-btn');
        if (seeMoreBtn) {
            seeMoreBtn.addEventListener('click', function () {
                // In a real implementation, this would load more questions
                alert('Pertanyaan lainnya akan segera dimuat!');
            });
        }
    });

    // Mobile View Switch Dropdown Logic
    mobileViewSwitchBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from closing immediately
        viewSwitchDropdown.style.display = viewSwitchDropdown.style.display === 'block' ? 'none' : 'block';
    });

    mobileMonthViewBtn.addEventListener('click', () => {
        switchView('month');
        viewSwitchDropdown.style.display = 'none'; // Close dropdown
    });

    mobileListViewBtn.addEventListener('click', () => {
        switchView('list');
        viewSwitchDropdown.style.display = 'none'; // Close dropdown
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', (event) => {
        if (!mobileViewSwitchBtn.contains(event.target) && !viewSwitchDropdown.contains(event.target)) {
            viewSwitchDropdown.style.display = 'none';
        }
    });
});

// Footer: Set current year
document.getElementById('current-year').textContent = new Date().getFullYear();

// Global function for opening image modal (called from HTML onclick)
function openImageModal(container) {
    console.log('openImageModal called');
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');

    if (imageModal && modalImage) {
        const img = container.querySelector('.register-image');
        if (img) {
            const imgSrc = img.getAttribute('src');
            const imgAlt = img.getAttribute('alt');

            modalImage.setAttribute('src', imgSrc);
            modalImage.setAttribute('alt', imgAlt);
            imageModal.style.display = 'flex';
        }
    }
}

// Set up image modal close functionality
document.addEventListener('DOMContentLoaded', function () {
    const imageModal = document.getElementById('image-modal');
    const closeImageModal = document.getElementById('close-image-modal');

    if (imageModal && closeImageModal) {
        // Close image modal when clicking the close button
        closeImageModal.addEventListener('click', function (e) {
            console.log('Close button clicked');
            e.stopPropagation(); // Prevent click from propagating to modal
            imageModal.style.display = 'none';
        });

        // Close image modal when clicking outside the image
        imageModal.addEventListener('click', function (e) {
            if (e.target === this) {
                console.log('Clicked outside image');
                imageModal.style.display = 'none';
            }
        });
    }
});