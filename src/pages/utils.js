import Swal from "sweetalert2";

export const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: "toast",
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

// Toast.fire({
//   icon: "success",
//   title: "Signed in ToastAlertsuccessfully",
// });
