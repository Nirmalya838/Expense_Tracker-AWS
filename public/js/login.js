const submit = document.getElementById('submit');

submit.addEventListener("click", AleradyUser);

async function AleradyUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const obj = {
    email: email,
    password: password,
  };
  
  try {
    const response = await axios.post(
      "http://13.48.237.70:80/user/login/login-user",
      obj
    );
    alert(response.data.message);
    localStorage.setItem('token',response.data.token);
    console.log(response.data.token);
        window.location.href="/expense/";
  } catch (err) {
    console.log(err);
    document.getElementById("err").innerText = err.response.data.message;
  }
}