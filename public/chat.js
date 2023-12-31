function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function getCurrentTime() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return time;
}

function outputUserJoined(username) {
  const userlist = document.getElementById('userlist');
  let user = document.createElement('li');
  user.textContent = `${username} joined.`;
  userlist.appendChild(user);
}

const messageList = document.getElementById('message-list');

document.getElementById('chat-form').addEventListener('submit', addChat);

async function addChat(event) {
  event.preventDefault();

  const msg = document.getElementById('msg').value;
  const token = sessionStorage.getItem("token");
  const user = parseJwt(token);

  const obj = {
    message: msg,
    userId: user.userId,
    username: user.username
  };

  try {
    let response = await axios.post(
      "/add-chat",
      obj,
      { headers: { Authorization: token } }
    );

    const newMessages = response.data;
    const messages = newMessages.slice(-10); // Only store the last 10 messages

    localStorage.setItem('messages', JSON.stringify(messages));
    document.getElementById('msg').value = '';
    document.getElementById('msg').focus();
  } catch (err) {
    console.log(err);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  let token = localStorage.getItem("token");
  const decode = parseJwt(token);
  const name = decode.username;
  outputUserJoined(name);

  // function outputMessage({ id, message, username, groupId }) {
  //   const chatMessage = { id, message, username, groupId };
  //   let messages = JSON.parse(localStorage.getItem('messages')) || [];
  //   messages.push(chatMessage);

  //   if (messages.length > 10) {
  //     messages = messages.slice(messages.length - 10);
  //   }

  //   localStorage.setItem('messages', JSON.stringify(messages));
  //   appendMessage(chatMessage);
  // }

  function outputMessage({ id, message, username, groupId }) {
    if (!groupId) {
      const chatMessage = { id, message, username, groupId };
      let messages = JSON.parse(localStorage.getItem('messages')) || [];
      messages.push(chatMessage);

      if (messages.length > 10) {
        messages = messages.slice(messages.length - 10);
      }

      localStorage.setItem('messages', JSON.stringify(messages));
      appendMessage(chatMessage);
    }
  }

  function appendMessage({ message, username }) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>${username}</strong> ${message}`;
    messageList.appendChild(listItem);
  }

  function loadMessagesFromLocalStorage() {
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    messageList.innerHTML = '';

    messages.forEach(message => {
      appendMessage(message);
    });
  }

  function getNewMessages() {
    axios.get('/get-chat')
      .then(response => {
        const newMessages = response.data;
        const messages = newMessages.slice(-10); // Only retrieve the last 10 messages

        localStorage.setItem('messages', JSON.stringify(messages));
        messageList.innerHTML = '';

        messages.forEach(message => {
          appendMessage(message);
        });
      })
      .catch(error => {
        console.error('Error retrieving messages:', error);
      });
  }

   loadMessagesFromLocalStorage();
   setInterval(getNewMessages, 1000);

  document.getElementById('log').addEventListener('click', ()=>{
    window.location.href = '/login';
  })

  document.getElementById('topLeftButton').addEventListener('click', showPopup);

  function showPopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "block";
  }

  document.getElementById('close').addEventListener('click', hidePopup);

  function hidePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";
  }

  document.getElementById('topLeftButton').addEventListener('click', populateCheckboxOptions);

  async function populateCheckboxOptions() {
    var checkboxOptions = document.getElementById("checkboxOptions");
    checkboxOptions.innerHTML = '';
  
    try {
      const response = await axios.get('/all-users');
      const users = response.data;
  
      users.forEach(function(user) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "participants";
        checkbox.value = user.name;
  
        var label = document.createElement("label");
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(user.name));
  
        checkboxOptions.appendChild(label);
        checkboxOptions.appendChild(document.createElement('br'));
      });
    } catch (error) {
      console.error('Error retrieving users:', error);
    }
  }
  
  async function displayGroupNames() {
    try {
      const response = await axios.get("/participatedGroups");
    
      if (response.status === 200) {
        const participationData = response.data;
        const groupData = participationData.groupData;
        const userId = decode.userId; 
        
        const associatedGroupData = groupData.filter(group => group.userId === userId);
        const groupIds = associatedGroupData.map(group => group.GroupGroupId);

        const groupNamesResponse = await axios.get("/group-names");
        const groupNamesData = groupNamesResponse.data;
    
        const groupContainer = document.getElementById("grouplist");
        groupContainer.innerHTML = "";
    
        groupIds.forEach(groupId => {
          const group = groupNamesData.groupName.find(group => group.group_id == groupId);
          if (group) {
            const button = document.createElement("button");
            button.textContent = group.group_name;
            button.classList.add("group-button");
            button.id = group.group_id;
            button.style.margin = "5px";
            button.style.padding = "10px";
            button.style.backgroundColor = "red";
            button.style.color = "black";
            button.style.fontWeight = 'bold';
            button.style.border = "none";
            button.style.borderRadius = '8px'
            button.style.cursor = "pointer";
  
            button.addEventListener("mouseenter", () => {
              button.style.backgroundColor = "blue";
            });
  
            button.addEventListener("mouseleave", () => {
              button.style.backgroundColor = "red";
            });

            button.addEventListener("click", () => {
              handleGroupButtonClick(group.group_id, group.group_name);
            });

            groupContainer.appendChild(button);
          }
        });
      } else {
        console.error("Failed to retrieve user participation data");
      }
    } catch (error) {
      console.error("Error occurred while retrieving user participation data", error);
    }
  }
    
  displayGroupNames();

  function handleGroupButtonClick(groupId, groupName) {
    window.location.href = `/group-chat/${groupId}+${groupName}`;
    }
    
});

