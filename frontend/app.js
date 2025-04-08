let contract;
let account;

async function init() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const accounts = await web3.eth.getAccounts();
        account = accounts[0];
        console.log("👤 Akun aktif:", account);

        try {
            const resAbi = await fetch(`abi.json?t=${Date.now()}`);
            const jsonData = await resAbi.json();
            const abi = jsonData.abi;

            const resConfig = await fetch(`config.json?t=${Date.now()}`);
            const config = await resConfig.json();
            const contractAddress = config.contractAddress;

            contract = new web3.eth.Contract(abi, contractAddress);
            console.log("✅ Kontrak berhasil diinisialisasi:", contract);

            // Ambil role & alamat dari localStorage
            const userRole = localStorage.getItem("userRole");
            const userAddr = localStorage.getItem("userAddr");

            if (userAddr) {
                document.getElementById("mahasiswaAddr").value = userAddr;
            }

            if (userRole) {
                aturTampilanRole(userRole);
            } else {
                showToast("🔐 Silakan login untuk mulai menggunakan sistem.");
            }

            await cekRole(); // Cek role dari smart contract

        } catch (e) {
            console.error("❌ Gagal load ABI atau config:", e);
        }
    } else {
        showToast("🦊 Install MetaMask terlebih dahulu.");
    }
}

function getAlamat() {
    const addr = document.getElementById("mahasiswaAddr").value;
    if (!web3.utils.isAddress(addr)) {
        showToast("❌ Alamat Ethereum tidak valid!");
        throw new Error("Invalid address");
    }
    return addr;
}

async function handleTambahNilai() {
    const mahasiswaAddr = getAlamat();
    const matkul = document.getElementById("matkul").value;
    const nilai = parseInt(document.getElementById("nilai").value);
    const accounts = await web3.eth.getAccounts();
    await contract.methods.tambahNilai(mahasiswaAddr, matkul, nilai).send({ from: accounts[0] });
    await kirimKePHP(mahasiswaAddr, matkul, nilai);
    await ambilLogAktivitas();
    document.getElementById("status").textContent = "✅ Nilai berhasil ditambahkan.";
    showToast("✅ Nilai berhasil ditambahkan.");
}

async function handleUpdateNilai() {
    const mahasiswaAddr = getAlamat();
    const matkul = document.getElementById("matkulUpdate").value;
    const nilaiBaru = parseInt(document.getElementById("nilaiBaru").value);
    const accounts = await web3.eth.getAccounts();
    await contract.methods.updateNilai(mahasiswaAddr, matkul, nilaiBaru).send({ from: accounts[0] });
    await kirimUpdateKePHP(mahasiswaAddr, matkul, nilaiBaru);
    await ambilLogAktivitas();
    document.getElementById("status").textContent = "✏️ Nilai berhasil diperbarui.";
    showToast("✏️ Nilai berhasil diperbarui.");
}

async function handleHapusNilai() {
    const mahasiswaAddr = getAlamat();
    const matkul = document.getElementById("matkulHapus").value;
    const accounts = await web3.eth.getAccounts();
    await contract.methods.hapusNilai(mahasiswaAddr, matkul).send({ from: accounts[0] });
    await kirimHapusKePHP(mahasiswaAddr, matkul);
    await ambilLogAktivitas();
    document.getElementById("status").textContent = "🗑️ Nilai berhasil dihapus.";
    showToast("🗑️ Nilai berhasil dihapus.");
}

async function handleLihatNilai() {
    const mahasiswaAddr = getAlamat();
    const data = await contract.methods.lihatNilai(mahasiswaAddr).call();
    tampilkanHasil(data);
}

async function handleFilterNilai() {
    const mahasiswaAddr = getAlamat();
    const nilaiMinimal = parseInt(document.getElementById("nilaiMinimal").value);
    await ambilFilterDariPHP(mahasiswaAddr, nilaiMinimal);
    const data = await contract.methods.filterNilai(mahasiswaAddr, nilaiMinimal).call();
    tampilkanHasil(data);
}

function tampilkanHasil(data) {
    const hasilList = document.getElementById("hasil");
    hasilList.innerHTML = "";

    if (data.length === 0) {
        hasilList.innerHTML = `
            <li class="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 px-4 py-2 rounded-xl shadow">
                ❌ Tidak ada data ditemukan.
            </li>`;
    } else {
        data.forEach((item) => {
            const li = document.createElement("li");

            li.classList.add("transition", "duration-300", "hover:scale-[1.02]");

            li.className +=
                " bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl p-4 mb-3 shadow-md";

            if (item.mata_kuliah && item.tanggal_input) {
                const tanggal = new Date(item.tanggal_input).toLocaleString("id-ID");
                li.innerHTML = `
                    <div class="font-semibold text-lg">📗 ${item.mata_kuliah}</div>
                    <div class="text-sm">Nilai: <span class="font-bold">${item.nilai}</span></div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">🕒 ${tanggal}</div>
                `;
            } else {
                li.innerHTML = `
                    <div class="font-semibold text-lg">📘 ${item.matkul}</div>
                    <div class="text-sm">Nilai: <span class="font-bold">${item.nilai}</span></div>
                `;
            }

            hasilList.appendChild(li);
        });
    }
}

async function kirimKePHP(mahasiswa, matkul, nilai) {
    const data = new URLSearchParams();
    data.append("mahasiswa", mahasiswa);
    data.append("matkul", matkul);
    data.append("nilai", nilai);

    const res = await fetch("../server/tambah_nilai.php", {
        method: "POST",
        body: data
    });

    const result = await res.json();
    console.log("📁 Hasil simpan ke MySQL:", result);
}

async function kirimUpdateKePHP(mahasiswa, matkul, nilai) {
    const data = new URLSearchParams();
    data.append("mahasiswa", mahasiswa);
    data.append("matkul", matkul);
    data.append("nilai", nilai);

    const res = await fetch("../server/update_nilai.php", {
        method: "POST",
        body: data
    });

    const result = await res.json();
    console.log("📝 Update MySQL:", result);
}

async function kirimHapusKePHP(mahasiswa, matkul) {
    const data = new URLSearchParams();
    data.append("mahasiswa", mahasiswa);
    data.append("matkul", matkul);

    const res = await fetch("../server/hapus_nilai.php", {
        method: "POST",
        body: data
    });

    const result = await res.json();
    console.log("🗑️ Hapus dari MySQL:", result);
}

async function ambilFilterDariPHP(mahasiswa, nilaiMinimal) {
    const data = new URLSearchParams();
    data.append("mahasiswa", mahasiswa);
    data.append("nilaiMinimal", nilaiMinimal);

    const res = await fetch("../server/filter_nilai.php", {
        method: "POST",
        body: data
    });

    const hasil = await res.json();
    console.log("🔍 Filter dari MySQL:", hasil);
    tampilkanHasil(hasil);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;
    toast.classList.remove("hidden");

    // Auto-hide setelah 3 detik
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}

async function ambilLogAktivitas() {
    const events = await contract.getPastEvents("allEvents", {
        fromBlock: 0,
        toBlock: "latest"
    });

    const logList = document.getElementById("logAktivitas");
    logList.innerHTML = "";

    if (events.length === 0) {
        logList.innerHTML = `
            <li class="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 px-4 py-2 rounded-xl shadow">
                ❌ Tidak ada log aktivitas ditemukan.
            </li>`;
        return;
    }

    for (const e of events.reverse()) {
        const li = document.createElement("li");

        const block = await web3.eth.getBlock(e.blockNumber);
        const waktu = new Date(block.timestamp * 1000).toLocaleString("id-ID");

        // ambil nilai fleksibel
        const nilai = e.returnValues.nilai ?? e.returnValues._nilai ?? e.returnValues.nilaiBaru ?? "-";
        const mahasiswa = e.returnValues.mahasiswa || e.returnValues._mahasiswa || "-";
        const matkul = e.returnValues.matkul || e.returnValues._matkul || "-";

        // Warna berdasarkan jenis event
        let bgColor = "";
        let icon = "";

        switch (e.event) {
            case "NilaiDitambahkan":
                bgColor = "bg-green-100 dark:bg-green-800 text-green-900 dark:text-green-100";
                icon = "➕";
                break;
            case "NilaiDiperbarui":
                bgColor = "bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100";
                icon = "✏️";
                break;
            case "NilaiDihapus":
                bgColor = "bg-red-100 dark:bg-red-800 text-red-900 dark:text-red-100";
                icon = "🗑️";
                break;
            default:
                bgColor = "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
                icon = "📄";
        }

        li.className = `${bgColor} rounded-xl p-4 shadow-md mb-3 transition duration-300 hover:scale-[1.02]`;

        li.innerHTML = `
            <div class="font-bold text-base">${icon} ${e.event}</div>
            <div class="text-sm">👨‍🎓 Mahasiswa: ${mahasiswa}</div>
            <div class="text-sm">📘 Matkul: ${matkul}</div>
            <div class="text-sm">📊 Nilai: ${nilai}</div>
            <div class="text-xs mt-2 italic text-gray-500 dark:text-gray-300">🕒 ${waktu}</div>
        `;

        logList.appendChild(li);
    }
}

async function cekRole() {
    if (!contract || !account) return;

    const roleIndex = await contract.methods.roles(account).call();
    const roleMapping = ["None", "mahasiswa", "dosen", "admin"];
    const role = roleMapping[roleIndex];

    console.log("🔐 Role dari kontrak:", role);

    localStorage.setItem("userRole", role);
    localStorage.setItem("userAddr", account);

    aturTampilanRole(role);
}

function handleLogin() {
    const role = document.getElementById("role").value;
    const loginAddr = document.getElementById("loginAddr").value;

    if (!role || !loginAddr) {
        showToast("❌ Isi role dan alamat akun terlebih dahulu.");
        return;
    }

    // Simpan data login (bisa di localStorage jika ingin persist)
    window.userRole = role;
    window.userAddr = loginAddr;

    // Sembunyikan login form, tampilkan konten
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("halamanKonten").classList.remove("hidden");
    document.getElementById("logoutBtn").classList.remove("hidden");

    aturTampilanRole(role);
}

function aturTampilanRole(role) {
    if (role === "mahasiswa") {
        document.getElementById("formTambah").classList.add("hidden");
        document.getElementById("formUpdate").classList.add("hidden");
        document.getElementById("formHapus").classList.add("hidden");
    }

    if (role === "dosen") {
        document.getElementById("formTambah").classList.remove("hidden");
        document.getElementById("formUpdate").classList.remove("hidden");
        document.getElementById("formHapus").classList.remove("hidden");
    }

    if (role === "admin") {
        // admin bisa akses semua, tidak ada yang disembunyikan
    }
}

function handleLogout() {
    window.userRole = null;
    window.userAddr = null;

    document.getElementById("halamanKonten").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("logoutBtn").classList.add("hidden");

    document.getElementById("status").textContent = "Berhasil logout.";
    document.getElementById("hasil").innerHTML = "";
}

window.addEventListener("load", init);
