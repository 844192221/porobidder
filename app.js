const STARTING_MONEY = 100;

const state = {
  userId: "",
  money: STARTING_MONEY,
  hasAuction: false,
};

const welcomeView = document.querySelector("#welcomeView");
const loginView = document.querySelector("#loginView");
const homeView = document.querySelector("#homeView");

const startButton = document.querySelector("#startButton");
const loginButton = document.querySelector("#loginButton");
const logoutButton = document.querySelector("#logoutButton");
const joinButton = document.querySelector("#joinButton");

const userIdInput = document.querySelector("#userIdInput");
const loginMessage = document.querySelector("#loginMessage");
const avatarPreview = document.querySelector("#avatarPreview");
const userIdText = document.querySelector("#userIdText");
const moneyText = document.querySelector("#moneyText");
const auctionStatusText = document.querySelector("#auctionStatusText");
const activityText = document.querySelector("#activityText");

function showView(viewName) {
  welcomeView.classList.toggle("hidden", viewName !== "welcome");
  loginView.classList.toggle("hidden", viewName !== "login");
  homeView.classList.toggle("hidden", viewName !== "home");
}

function renderHome() {
  userIdText.textContent = state.userId;
  moneyText.textContent = state.money;

  if (state.hasAuction) {
    auctionStatusText.textContent = "可加入";
    activityText.textContent = "市场里有一个正在营业的拍卖摊位。";
    joinButton.disabled = false;
  } else {
    auctionStatusText.textContent = "暂无";
    activityText.textContent = "现在还没有开摊的拍卖活动。";
    joinButton.disabled = true;
  }
}

function login() {
  const userId = userIdInput.value.trim();

  if (!userId) {
    loginMessage.textContent = "请输入 ID。";
    return;
  }

  state.userId = userId;
  state.money = STARTING_MONEY;
  loginMessage.textContent = "";
  renderHome();
  showView("home");
}

function updateAvatarPreview() {
  const userId = userIdInput.value.trim();
  avatarPreview.textContent = userId ? userId.slice(0, 1).toUpperCase() : "?";
}

function logout() {
  state.userId = "";
  state.money = STARTING_MONEY;
  userIdInput.value = "";
  loginMessage.textContent = "";
  updateAvatarPreview();
  showView("welcome");
}

startButton.addEventListener("click", () => {
  showView("login");
  userIdInput.focus();
});

loginButton.addEventListener("click", login);

userIdInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    login();
  }
});

userIdInput.addEventListener("input", updateAvatarPreview);
logoutButton.addEventListener("click", logout);

showView("welcome");
