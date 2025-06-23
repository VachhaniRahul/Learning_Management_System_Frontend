import Swal from 'sweetalert2';

export const showToast = (type, title, position = 'top-end') => {
  Swal.fire({
    icon: type,
    title,
    toast: true,
    position,
    timer: 2000,
    showConfirmButton: false,
    timerProgressBar: true
  });
};
