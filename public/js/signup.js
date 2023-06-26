const submit = document.getElementById('submit');

submit.addEventListener('click', AddUser);

async function AddUser(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const cnfPassword = document.getElementById('cnfpassword').value;

  const obj = {
    name: name,
    email: email,
    password: password,
    totalamount: 0,
  };
  if (password == cnfPassword) {
    try {
      const response = await axios.post('/user/sign-up', obj);
      alert('User Signed Up successfully!');
      location.reload();
    } catch (err) {
      const errorElement = document.getElementById('error-message');
      if (err.response.status == 400) {
        errorElement.textContent = "Email already exists!";
      } else {
        errorElement.textContent = "An error occurred. Please try again later.";
      }
      console.log('Error occurred:', err.message);
    }
  } else {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = "Password doesn't match!";
    errorElement.style.color = 'red';
  }
}
