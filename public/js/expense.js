const itemList = document.getElementById("details");
const boardList = document.getElementById("boards");
const adddata = document.querySelector(".adddata");
const leaderboard = document.getElementById("leaderboard");
const rzp = document.querySelector(".rzp");

adddata.addEventListener("click", addItem);
rzp.addEventListener("click", BuyPremium);
leaderboard.addEventListener("click", premiumFeature);

let logOutButton = document.getElementById('log');  
    logOutButton.addEventListener('click', function() {
      window.location.href = '/user/login';
    });

async function addItem(event) {
  event.preventDefault();

  const amount = document.getElementById("amount").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;

  const obj = {
    amount: amount,
    description: description,
    category: category,
  };
  try {
    let token = localStorage.getItem("token");
    let response = await axios.post(
      "/expense/add-expense",
      obj,
      { headers: { Authorization: token } }
    );
    showOnScreen(response.data.newexpense);
    document.getElementById("amount").value='';
    document.getElementById("description").value='';
    document.getElementById("category").value='';
  } catch (err) {
    console.log(err);
  }
}

async function BuyPremium(event) {
  event.preventDefault();
  try {
    let token = localStorage.getItem("token");
    const response = await axios.get(
      "/purchase/premiummembership",
      { headers: { Authorization: token } }
    );

    const options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async function (response) {
        const res = await axios.post(
          "/purchase/updatestatus",
          {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },
          { headers: { Authorization: token } }
        );
        alert("Congratulations! you are Premium Member Now.");
        document.querySelector("#rzp").style.visibility = "hidden";
        document.querySelector("#msg").textContent = "Premium User";
        document.getElementById("leaderboard").textContent = "Leaderboard";
        document.getElementById("downloadexpense").textContent = "Download File";
        document.getElementById("leaderboard").style.visibility = "visible";
        document.getElementById("downloadexpense").style.visibility = "visible";
        // // showDownloadLinks();
        localStorage.setItem("token", res.data.token);  
      },
    };

    const rzpl = new Razorpay(options);

    rzpl.open();
    rzpl.on("payment.failed", async function (res) {
      await axios.post(
        "/purchase/updatefailure",
        {
          order_id: response.data.order.id,
        },
        { headers: { Authorization: token } }
      );
      alert("something went wrong");
    });
  } catch (err) {
    console.log(err);
  }
}

async function premiumFeature(event) {
  event.preventDefault();
  try {
    let token = localStorage.getItem("token");
    const response = await axios.get(
      "/premium/leaderboard",
      {
        headers: { Authorization: token },
      }
    );
    document.getElementById("boards").innerHTML = "<h2>Leader Board</h2>";
    console.log(response);
    response.data.forEach((details, index) => {
      let newItem = document.createElement("li");
      newItem.appendChild(
        document.createTextNode(
          ` ${index+1}. ${details.name} Total Expense - ${details.total_cost}/-`
        )
      );
      boardList.appendChild(newItem);
    });
  } catch (err) {
    console.log(err);
  }
}

async function download() {
  let token = localStorage.getItem("token");
  try {
    const response = await axios.get("/expense/download", {
      headers: { Authorization: token },
    });
    var a = document.createElement("a");
    a.href = response.data.fileUrl;
    a.download = "myexpense.csv";
    a.click();
  } catch (err) {
    console.log(err);
  }
}

function showDownloadLinks() {
  const inputElement = document.createElement("input");
  inputElement.type = "button";
  inputElement.value = "Show Download File Link";
  inputElement.id = "downloadfile-btn";
  inputElement.style.backgroundColor = "gold";
  inputElement.style.color = "black";
  inputElement.style.borderRadius = "15px";
  inputElement.style.padding = "8px";
  inputElement.style.marginLeft = "100px";
  const header = document.getElementById("main-header");
  header.appendChild(inputElement);

  inputElement.onclick = async () => {
    const heading = document.getElementById("heading");
    heading.innerText = "Show Download Url";
    const downloadUrl = document.getElementById("downloadlinks");
    const token = localStorage.getItem("token");

    const downloadLinks = await axios.get(
      "/expense/show-downloadLink",
      { headers: { Authorization: token } }
    );
    console.log("downloadLinks", downloadLinks);
    if (downloadLinks.data.url == [] || downloadLinks.data.url == "") {
      const li = document.createElement("li");
      li.innerText = "No Downloaded Url";
      downloadUrl.append(li);
    } else {
      downloadLinks.data.url.forEach((Element) => {
        console.log("Element.filelink", Element);
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `${Element.filelink}`;
        a.innerHTML = ` Url:  ${Element.filelink} `;
        li.appendChild(a);
        downloadUrl.appendChild(li);
      });
    }
  };
}

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

window.addEventListener("DOMContentLoaded", async () => {
  try {
    let token = localStorage.getItem("token");
    const decode = parseJwt(token);    
    const name = decode.username;
    const profile = document.createElement('p');
    profile.textContent=`${name}`;
    profile.style.fontSize='15px'
    const logout = document.getElementById('log');
    logout.appendChild(profile);
  const isAdmin = decode.ispremuimuser;
    if (isAdmin == true) {
      document.querySelector("#rzp").style.visibility = "hidden";
      document.querySelector("#msg").textContent = "You Are Premium User";
      document.getElementById("leaderboard").textContent = "Leaderboard";
      document.getElementById("downloadexpense").textContent = "Download File";
      // showDownloadLinks();
    }
    else {
      document.querySelector("#msg").textContent = "Become a Premium User Now!!!";
      document.getElementById("leaderboard").style.visibility = "hidden";
      document.getElementById("downloadexpense").style.visibility = "hidden";
    }
    const page = 1;
    let pagesize = localStorage.getItem("pagesize");
    let response = await axios.get(
      `/expense/expenses/load-data?page=${page}&pagesize=${pagesize}`,
      { headers: { Authorization: token } }
    );
    for (let i = 0; i < response.data.expenses.length; i++) {
      showOnScreen(response.data.expenses[i]);
    }
    showPagination(response.data);
  } catch (err) {
    console.log(err);
  }
});

function showPagination({
  currentPage,
  hasNextPage,
  nextPage,
  hasPreviousPage,
  previousPage,
}) {
  const dynamicpagination = document.getElementById("dynamicpagination");
  if (dynamicpagination) {
    dynamicpagination.addEventListener("change", () => {
      const pageSize = document.getElementById("dynamicpagination").value;
      localStorage.setItem("pagesize", pageSize);
      getProducts(currentPage);
    });
  }
  const pagination = document.getElementById("pagination");

  if (hasPreviousPage) {
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = previousPage;
    prevBtn.addEventListener("click", () => {
      getProducts(previousPage);
    });
    pagination.appendChild(prevBtn);
  }

  const crtBtn = document.createElement("button");
  crtBtn.innerHTML = currentPage;
  crtBtn.addEventListener("click", () => {
    getProducts(currentPage);
  });
  pagination.appendChild(crtBtn);
  if (hasNextPage) {
    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = nextPage;
    nextBtn.addEventListener("click", () => {
      getProducts(nextPage);
    });
    pagination.appendChild(nextBtn);
  }
}

async function getProducts(page) {
  const token = localStorage.getItem("token");
  const pageSize = localStorage.getItem("pagesize");
  let response = await axios.get(
    `/expense/expenses/load-data?page=${page}&pagesize=${pageSize}`,
    { headers: { Authorization: token } }
  );
  const ul = document.getElementById("details");
  const listItems = document.querySelectorAll("#details li");

  console.log(listItems);

  listItems.forEach((listItem) => {
    listItem.parentNode.removeChild(listItem);
  });

  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 0; i < response.data.expenses.length; i++) {
    showOnScreen(response.data.expenses[i]);
  }
  showPagination(response.data);
}

function showOnScreen(obj) {
  let newItem = document.createElement("li");
  newItem.className = "item";
  newItem.appendChild(
    document.createTextNode(
      "Amount:" + obj.amount + "/-  " + "Desc:" + obj.description + " " + "Type:" + obj.category
    )
  );

  let deleteBtn = document.createElement("button");
  deleteBtn.className = "delete fgttBtn";
  deleteBtn.appendChild(document.createTextNode("Delete"));
  newItem.appendChild(deleteBtn);

  deleteBtn.onclick = async (e) => {
    let li = e.target.parentElement;
    let id = obj.id;
    await axios.delete("/expense/delete-expense/" + id);
    itemList.removeChild(li);
  };

  itemList.appendChild(newItem);
}
