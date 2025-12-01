document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants</h5>
            <ul class="participants-list">
              ${details.participants.length === 0
                ? '<li><em>No participants yet</em></li>'
                : details.participants.map(email => `<li class="participant-item" data-email="${email}">${email} <span class="delete-icon" title="Remove">&#128465;</span></li>`).join('')}
            </ul>
          </div>
        `;

        // Add event listener for delete icon
        setTimeout(() => {
          const participantItems = activityCard.querySelectorAll('.participant-item');
          participantItems.forEach(item => {
            const deleteIcon = item.querySelector('.delete-icon');
            if (deleteIcon) {
              deleteIcon.addEventListener('click', async () => {
                const email = item.getAttribute('data-email');
                // Unregister participant via API
                try {
                  const res = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(email)}`, {
                    method: 'POST',
                  });
                  const result = await res.json();
                  if (res.ok) {
                    messageDiv.textContent = result.message || 'Participant removed.';
                    messageDiv.className = 'success';
                    messageDiv.classList.remove('hidden');
                    // Refresh activities list
                    fetchActivities();
                  } else {
                    messageDiv.textContent = result.detail || 'Failed to remove participant.';
                    messageDiv.className = 'error';
                    messageDiv.classList.remove('hidden');
                  }
                  setTimeout(() => {
                    messageDiv.classList.add('hidden');
                  }, 4000);
                } catch (err) {
                  messageDiv.textContent = 'Error removing participant.';
                  messageDiv.className = 'error';
                  messageDiv.classList.remove('hidden');
                  setTimeout(() => {
                    messageDiv.classList.add('hidden');
                  }, 4000);
                }
              });
            }
          });
        }, 0);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
