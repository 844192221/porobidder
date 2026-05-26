const STARTING_MONEY = 100;

const state = {
  userId: "",
  money: STARTING_MONEY,
  hasAuction: true,
  joinedAuction: false,
  auction: {
    name: "新人试拍摊位",
    startAt: "2026-05-27T04:30:00Z",
    baseMoney: 100,
  },
};

const welcomeView = document.querySelector("#welcomeView");
const loginView = document.querySelector("#loginView");
const homeView = document.querySelector("#homeView");
const auctionView = document.querySelector("#auctionView");

const startButton = document.querySelector("#startButton");
const loginButton = document.querySelector("#loginButton");
const logoutButton = document.querySelector("#logoutButton");
const joinButton = document.querySelector("#joinButton");
const backHomeButton = document.querySelector("#backHomeButton");

const userIdInput = document.querySelector("#userIdInput");
const loginMessage = document.querySelector("#loginMessage");
const avatarPreview = document.querySelector("#avatarPreview");
const userIdText = document.querySelector("#userIdText");
const moneyText = document.querySelector("#moneyText");
const auctionStatusText = document.querySelector("#auctionStatusText");
const activityNameText = document.querySelector("#activityNameText");
const activityStatusBadge = document.querySelector("#activityStatusBadge");
const activityText = document.querySelector("#activityText");
const activityMeta = document.querySelector("#activityMeta");
const auctionRoomName = document.querySelector("#auctionRoomName");
const currentPlayerCard = document.querySelector("#currentPlayerCard");
const roomItemStatus = document.querySelector("#roomItemStatus");
const roomItemSymbol = document.querySelector("#roomItemSymbol");
const roomItemHint = document.querySelector("#roomItemHint");
const roomAvatar = document.querySelector("#roomAvatar");
const roomUserId = document.querySelector("#roomUserId");
const roomMoney = document.querySelector("#roomMoney");

function showView(viewName) {
  welcomeView.classList.toggle("hidden", viewName !== "welcome");
  loginView.classList.toggle("hidden", viewName !== "login");
  homeView.classList.toggle("hidden", viewName !== "home");
  auctionView.classList.toggle("hidden", viewName !== "auction");
}

function renderHome() {
  userIdText.textContent = state.userId;
  moneyText.textContent = state.money;

  if (state.hasAuction) {
    const auctionStarted = isAuctionStarted(state.auction.startAt);
    const statusText = getAuctionStatusText(auctionStarted);

    activityNameText.textContent = state.auction.name;
    auctionStatusText.textContent = statusText;
    activityStatusBadge.textContent = statusText;
    activityStatusBadge.classList.toggle("joined", state.joinedAuction);
    activityStatusBadge.classList.toggle("live", auctionStarted);
    activityText.textContent = getActivityText(auctionStarted);
    activityMeta.innerHTML = `
      <span>${formatAuctionTime(state.auction.startAt)}</span>
      <span>初始资金 ${state.auction.baseMoney}</span>
    `;
    renderActivityButton(auctionStarted);
  } else {
    activityNameText.textContent = "拍卖摊位";
    auctionStatusText.textContent = "暂无";
    activityStatusBadge.textContent = "暂无";
    activityStatusBadge.classList.remove("joined");
    activityText.textContent = "现在还没有开摊的拍卖活动。";
    activityMeta.innerHTML = "";
    joinButton.textContent = "加入活动";
    joinButton.disabled = true;
  }
}

function getAuctionStatusText(auctionStarted) {
  if (!state.joinedAuction) return "开放中";
  return auctionStarted ? "进行中" : "等待开摊";
}

function getActivityText(auctionStarted) {
  if (!state.joinedAuction) {
    return "市场里有一个正在营业的拍卖摊位，可以先加入占个位置。";
  }

  if (auctionStarted) {
    return "拍卖已经开始，可以进入房间等待竞品上架。";
  }

  return "你已经加入这个拍卖摊位。可以先进入房间，没到点前不会显示竞品。";
}

function renderActivityButton(auctionStarted) {
  if (!state.joinedAuction) {
    joinButton.textContent = "加入活动";
    joinButton.disabled = false;
    return;
  }

  joinButton.textContent = auctionStarted ? "进入竞拍" : "进入房间";
  joinButton.disabled = false;
}

function isAuctionStarted(startAt) {
  return Date.now() >= new Date(startAt).getTime();
}

function formatAuctionTime(startAt) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDate = new Date(startAt);
  const timeText = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: userTimeZone,
  }).format(startDate);
  const dateText = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: userTimeZone,
  }).format(startDate);
  const timezoneText = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    timeZoneName: "short",
  })
    .formatToParts(startDate)
    .find((part) => part.type === "timeZoneName")?.value;

  return `${timeText} ${dateText} ${timezoneText || userTimeZone}`;
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
  state.joinedAuction = false;
  userIdInput.value = "";
  loginMessage.textContent = "";
  updateAvatarPreview();
  showView("welcome");
}

function joinAuction() {
  if (!state.hasAuction) return;

  if (state.joinedAuction) {
    enterAuctionRoom();
    return;
  }

  state.joinedAuction = true;
  renderHome();
}

function enterAuctionRoom() {
  renderAuctionRoom();
  showView("auction");
}

function renderAuctionRoom() {
  const auctionStarted = isAuctionStarted(state.auction.startAt);

  auctionRoomName.textContent = state.auction.name;
  currentPlayerCard.classList.toggle("waiting", !auctionStarted);
  roomItemStatus.textContent = auctionStarted ? "等待上架" : "等待开摊";
  roomItemSymbol.textContent = auctionStarted ? "?" : "...";
  roomItemHint.textContent = auctionStarted
    ? "拍卖已开始。下一步我们会在这里显示选手 ID、位置和起拍价。"
    : "你已经在房间里了。时间到了之后，竞品会出现在这里。";
  roomAvatar.textContent = state.userId ? state.userId.slice(0, 1).toUpperCase() : "?";
  roomUserId.textContent = state.userId;
  roomMoney.textContent = state.money;
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
joinButton.addEventListener("click", joinAuction);
backHomeButton.addEventListener("click", () => {
  renderHome();
  showView("home");
});

setInterval(() => {
  if (!homeView.classList.contains("hidden")) {
    renderHome();
  }
  if (!auctionView.classList.contains("hidden")) {
    renderAuctionRoom();
  }
}, 30000);

showView("welcome");
