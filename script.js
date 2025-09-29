/* =========================================================
   REGISTRASI ULANG SIMPSIUM - VERSI TANPA SCAN KTP
   ========================================================= */
const scriptURL =
  'https://script.google.com/macros/s/AKfycbwyPZyxNub1BbtxrFy0Pp2EaG42EZcr83-3gwcKVaFirw_AOeQNbyfWXRlbl5N3KKWC/exec'; // <-- GANTI DG MILIK ANDA

/* ---------------------------------------------------------
   1. VALIDASI FORMAT NO-TELEPON (hanya UI, tanpa fetch)
   --------------------------------------------------------- */
const notelp      = document.getElementById('notelp');
const notelpError = document.getElementById('notelpError');

function validasiFormatNoTelp() {
  const val = notelp.value.trim();
  if (!val) {                         // kosong diperbolehkan
    notelpError.style.display = 'none';
    return true;
  }
  if (!/^[0-9]{10,15}$/.test(val)) {  // 10-15 digit
    notelpError.style.display = 'block';
    return false;
  }
  notelpError.style.display = 'none';
  return true;
}
notelp.addEventListener('input', validasiFormatNoTelp);

/* ---------------------------------------------------------
   2. VALIDASI FORMAT NIK (16 digit)
   --------------------------------------------------------- */
const nik      = document.getElementById('nik');
const nikError = document.getElementById('nikError');

function validasiFormatNIK() {
  const val = nik.value.trim();
  if (!val) {
    nikError.style.display = 'none';
    return true;
  }
  if (!/^\d{16}$/.test(val)) {
    nikError.style.display = 'block';
    return false;
  }
  nikError.style.display = 'none';
  return true;
}
nik.addEventListener('input', validasiFormatNIK);

/* cegah submit kalau NIK salah */
document.querySelector('form')?.addEventListener('submit', e => {
  if (!validasiFormatNIK()) {
    e.preventDefault();
    nik.focus();
  }
});

/* ---------------------------------------------------------
   3. CEK DATA BERDASARKAN NO-TELEPON (FETCH) 
      --> baru dijalankan saat tombol "Cek No Telp" diklik
   --------------------------------------------------------- */
function cekNoTelp() {                 // dipanggil onclick di HTML
  if (!validasiFormatNoTelp()) {
    alert('Nomor telepon tidak valid.');
    return;
  }

  const notelpVal = notelp.value.trim();
  fetch(`${scriptURL}?notelp=${notelpVal}`)
    .then(r => r.json())
    .then(data => {
      const box    = document.getElementById('dataLama');
      const regBox = document.getElementById('telahRegistrasi');
      const submit = document.getElementById('submitBtn');

      if (data.found) {
        // isi form otomatis
        document.getElementById('nama').value      = data.nama;
        document.getElementById('instansi').value  = data.instansi;
        document.getElementById('email').value     = data.email;
        document.getElementById('nik').value       = data.nik;
        document.getElementById('profesi').value   = data.profesi;
        document.getElementById('keterangan').value= data.keterangan;

        box.style.display = 'block';

        if (data.keterangan === 'Telah Terima Symposium Kit (E-Toll)') {
          regBox.style.display = 'block';
          submit.disabled = true;
          submit.style.background = '#ccc';
          submit.style.cursor = 'not-allowed';
        } else {
          regBox.style.display = 'none';
          submit.disabled = false;
          submit.style.background = '';
          submit.style.cursor = '';
        }
      } else {
        // tidak ditemukan
        box.style.display    = 'none';
        regBox.style.display = 'none';
        submit.disabled      = false;
        submit.style.background = '';
        submit.style.cursor  = '';
        alert('Data tidak ditemukan, silakan isi lengkap.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Gagal cek No Telp.');
    });
}

/* ---------------------------------------------------------
   4. PROSES SUBMIT (INSERT / UPDATE)
   --------------------------------------------------------- */
document.getElementById('formRegistrasi').addEventListener('submit', function (e) {
  e.preventDefault();

  const keterangan = document.getElementById('keterangan').value;
  if (keterangan === 'Telah Terima Symposium Kit (E-Toll)') {
    // double-check apakah memang belum pernah ambil kit
    const notelpVal = notelp.value.trim();
    fetch(`${scriptURL}?notelp=${notelpVal}`)
      .then(r => r.json())
      .then(data => {
        if (data.found && data.keterangan === 'Telah Terima Symposium Kit (E-Toll)') {
          alert('TIDAK DAPAT REGISTRASI ULANG - Sudah menerima Symposium Kit');
          return;
        }
        kirimData();
      });
  } else {
    kirimData();
  }
});

function kirimData() {
  const wrap = document.getElementById('progressWrap');
  const bar  = document.getElementById('progressBar');
  const msg  = document.getElementById('msgSukses');

  wrap.style.display = 'block';
  bar.style.width = '0%';

  let w = 0;
  const t = setInterval(() => {
    w += 3; bar.style.width = w + '%';
    if (w >= 90) clearInterval(t);
  }, 30);

  const payload = new FormData(document.getElementById('formRegistrasi'));
  fetch(scriptURL, { method: 'POST', body: payload })
    .then(r => r.text())
    .then(() => {
      clearInterval(t);
      bar.style.width = '100%';
      setTimeout(() => {
        wrap.style.display = 'none';
        msg.style.display = 'block';
      }, 300);
    })
    .catch(() => {
      clearInterval(t);
      wrap.style.display = 'none';
      alert('Gagal menyimpan.');
    });
}

/* ---------------------------------------------------------
   5. TOMBOL REFRESH
   --------------------------------------------------------- */
document.getElementById('btnInputKembali').addEventListener('click', () => {
  location.reload();
});



