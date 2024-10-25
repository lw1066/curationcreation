export function showUserFeedback(message: string) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.position = "fixed";
  toast.style.bottom = "100px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = "#f44336";
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "5px";
  toast.style.zIndex = "9999";

  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}
