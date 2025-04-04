// This file will be executed in a Node.js environment on Vercel
module.exports = (req, res) => {
  // Get the username from the URL hash or query parameter
  const url = new URL(req.url, `http://${req.headers.host}`)
  const username = url.hash ? url.hash.substring(1) : url.searchParams.get("user")

  // Send the HTML with embedded JavaScript
  res.setHeader("Content-Type", "text/html")
  res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Viewer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .profile-container {
      width: 100%;
      max-width: 400px;
    }
    
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      transition: opacity 0.5s ease;
    }
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .profile-card-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    
    .profile-card {
      width: 100%;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .profile-avatar {
      margin-top: 20px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .profile-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .social-icons {
      display: flex;
      gap: 10px;
      margin: 15px 0;
    }
    
    .social-icons a {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: white;
      transition: opacity 0.2s;
    }
    
    .social-icons a:hover {
      opacity: 0.9;
    }
    
    .discord-icon {
      background-color: #5865F2;
    }
    
    .telegram-icon {
      background-color: #0088cc;
    }
    
    .profile-info {
      width: 100%;
      padding: 20px;
      text-align: center;
      cursor: pointer;
    }
    
    .profile-info h2 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .profile-info p {
      color: #666;
    }
    
    .profile-info h3 {
      font-size: 18px;
      margin-bottom: 12px;
    }
    
    .profile-info ul {
      list-style: none;
    }
    
    .past-nickname {
      text-decoration: line-through;
      color: #999;
      margin-bottom: 5px;
    }
    
    .error-container {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      color: #e74c3c;
      text-align: center;
      max-width: 400px;
      margin: 100px auto;
    }
  </style>
</head>
<body>
  <div class="profile-container" id="main-container">
    <div id="loading-screen" class="loading-screen">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>
    </div>
    <div id="profile-container" class="profile-card-container" style="display: none;"></div>
    <div id="error-container" class="error-container" style="display: none;"></div>
  </div>

  <script>
    // Client-side JavaScript
    (function() {
      // Initialize when DOM is loaded
      document.addEventListener('DOMContentLoaded', init);

      // Main initialization function
      function init() {
        // Get username from URL hash or query parameter
        const hash = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(window.location.search);
        const queryUser = urlParams.get('user');
        const username = hash || queryUser;
        
        if (!username) {
          showError("No username provided in URL hash or query parameter");
          return;
        }
        
        // Show loading screen for 5 seconds
        setTimeout(() => {
          fetchUserData(username);
        }, 5000);
      }
      
      // Hide loading screen with fade effect
      function hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
      
      // Show error message
      function showError(message) {
        const errorContainer = document.getElementById('error-container');
        const profileContainer = document.getElementById('profile-container');
        
        errorContainer.innerHTML = \`<p>\${message}</p>\`;
        errorContainer.style.display = 'block';
        profileContainer.style.display = 'none';
        hideLoading();
      }
      
      // Fetch user data from JSON file
      async function fetchUserData(username) {
        try {
          const response = await fetch(\`/Users/\${username}.json\`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          
          const userData = await response.json();
          renderProfile(userData);
        } catch (err) {
          showError("Error loading user profile");
          console.error(err);
        }
      }
      
      // Render user profile
      function renderProfile(user) {
        const profileContainer = document.getElementById('profile-container');
        
        // Create profile HTML
        const profileHTML = \`
          <div class="profile-card">
            <div class="profile-avatar">
              <img src="\${user.avatar || '/placeholder.svg?height=96&width=96'}" alt="\${user.nickname}" />
            </div>
            
            <div class="social-icons">
              \${user.discord ? \`
                <a href="https://discord.com/users/\${user.discord}" target="_blank" rel="noopener noreferrer" class="discord-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </a>
              \` : ''}
              
              \${user.telegram ? \`
                <a href="https://t.me/\${user.telegram}" target="_blank" rel="noopener noreferrer" class="telegram-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                </a>
              \` : ''}
            </div>
            
            <div class="profile-info" id="profile-info">
              <h2>\${user.nickname}</h2>
              <p>\${user.bio || "Click to see past nicknames"}</p>
            </div>
          </div>
        \`;
        
        // Set profile HTML
        profileContainer.innerHTML = profileHTML;
        profileContainer.style.display = 'flex';
        
        // Hide loading screen
        hideLoading();
        
        // Add click event to toggle past nicknames
        const profileInfo = document.getElementById('profile-info');
        let showingPastNicknames = false;
        
        profileInfo.addEventListener('click', () => {
          if (!showingPastNicknames) {
            // Show past nicknames
            let pastNicknamesHTML = '<h3>Past Nicknames:</h3>';
            
            if (user.past_nicknames && user.past_nicknames.length > 0) {
              pastNicknamesHTML += '<ul>';
              user.past_nicknames.forEach(nick => {
                pastNicknamesHTML += \`<li class="past-nickname">\${nick}</li>\`;
              });
              pastNicknamesHTML += '</ul>';
            } else {
              pastNicknamesHTML += '<p>No past nicknames</p>';
            }
            
            profileInfo.innerHTML = pastNicknamesHTML;
          } else {
            // Show current nickname
            profileInfo.innerHTML = \`
              <h2>\${user.nickname}</h2>
              <p>\${user.bio || "Click to see past nicknames"}</p>
            \`;
          }
          
          showingPastNicknames = !showingPastNicknames;
        });
      }
    })();
  </script>
</body>
</html>
  `)
}

