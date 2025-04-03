// Main profile viewer script
;(() => {
  // DOM Elements
  let loadingScreen = null
  let profileContainer = null
  let errorContainer = null

  // Initialize the application
  function init() {
    // Create DOM elements
    createElements()

    // Get username from URL hash
    const hash = window.location.hash.substring(1)

    if (!hash) {
      showError("No username provided in URL hash")
      return
    }

    // Show loading screen
    showLoading()

    // Fetch user data after 5 seconds
    setTimeout(() => {
      fetchUserData(hash)
    }, 5000)
  }

  // Create DOM elements
  function createElements() {
    // Main container
    const mainContainer = document.createElement("div")
    mainContainer.className = "profile-container"
    document.body.appendChild(mainContainer)

    // Loading screen
    loadingScreen = document.createElement("div")
    loadingScreen.className = "loading-screen"
    loadingScreen.innerHTML = `
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>
    `
    document.body.appendChild(loadingScreen)

    // Profile container
    profileContainer = document.createElement("div")
    profileContainer.className = "profile-card-container"
    profileContainer.style.display = "none"
    mainContainer.appendChild(profileContainer)

    // Error container
    errorContainer = document.createElement("div")
    errorContainer.className = "error-container"
    errorContainer.style.display = "none"
    mainContainer.appendChild(errorContainer)
  }

  // Show loading screen
  function showLoading() {
    loadingScreen.style.display = "flex"
    profileContainer.style.display = "none"
    errorContainer.style.display = "none"
  }

  // Hide loading screen with fade effect
  function hideLoading() {
    loadingScreen.style.opacity = "0"
    setTimeout(() => {
      loadingScreen.style.display = "none"
    }, 500)
  }

  // Show error message
  function showError(message) {
    errorContainer.innerHTML = `<p>${message}</p>`
    errorContainer.style.display = "block"
    profileContainer.style.display = "none"
    hideLoading()
  }

  // Fetch user data
  async function fetchUserData(username) {
    try {
      const response = await fetch(`/Users/${username}.json`)

      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }

      const userData = await response.json()
      renderProfile(userData)
    } catch (err) {
      showError("Error loading user profile")
      console.error(err)
    }
  }

  // Render user profile
  function renderProfile(user) {
    // Create profile HTML
    const profileHTML = `
      <div class="profile-card">
        <div class="profile-avatar">
          <img src="${user.avatar || "/placeholder.svg?height=96&width=96"}" alt="${user.nickname}" />
        </div>
        
        <div class="social-icons">
          ${
            user.discord
              ? `
            <a href="https://discord.com/users/${user.discord}" target="_blank" rel="noopener noreferrer" class="discord-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </a>
          `
              : ""
          }
          
          ${
            user.telegram
              ? `
            <a href="https://t.me/${user.telegram}" target="_blank" rel="noopener noreferrer" class="telegram-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
            </a>
          `
              : ""
          }
        </div>
        
        <div class="profile-info" id="profile-info">
          <h2>${user.nickname}</h2>
          <p>${user.bio || "Click to see past nicknames"}</p>
        </div>
      </div>
    `

    // Set profile HTML
    profileContainer.innerHTML = profileHTML
    profileContainer.style.display = "flex"

    // Hide loading screen
    hideLoading()

    // Add click event to toggle past nicknames
    const profileInfo = document.getElementById("profile-info")
    let showingPastNicknames = false

    profileInfo.addEventListener("click", () => {
      if (!showingPastNicknames) {
        // Show past nicknames
        let pastNicknamesHTML = "<h3>Past Nicknames:</h3>"

        if (user.past_nicknames && user.past_nicknames.length > 0) {
          pastNicknamesHTML += "<ul>"
          user.past_nicknames.forEach((nick) => {
            pastNicknamesHTML += `<li class="past-nickname">${nick}</li>`
          })
          pastNicknamesHTML += "</ul>"
        } else {
          pastNicknamesHTML += "<p>No past nicknames</p>"
        }

        profileInfo.innerHTML = pastNicknamesHTML
      } else {
        // Show current nickname
        profileInfo.innerHTML = `
          <h2>${user.nickname}</h2>
          <p>${user.bio || "Click to see past nicknames"}</p>
        `
      }

      showingPastNicknames = !showingPastNicknames
    })
  }

  // Initialize when DOM is loaded
  document.addEventListener("DOMContentLoaded", init)
})()

