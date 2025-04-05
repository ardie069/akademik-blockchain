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
        } catch (e) {
            console.error("❌ Gagal load ABI atau config:", e);
        }
    } else {
        alert("🦊 Install MetaMask terlebih dahulu.");
    }
}

function getAlamat() {
    const addr = document.getElementById("mahasiswaAddr").value;
    if (!web3.utils.isAddress(addr)) {
        alert("Alamat Ethereum tidak valid!");
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
    document.getElementById("status").textContent = "✅ Nilai berhasil ditambahkan.";
}

async function handleUpdateNilai() {
    const mahasiswaAddr = getAlamat();
    const matkul = document.getElementById("matkulUpdate").value;
    const nilaiBaru = parseInt(document.getElementById("nilaiBaru").value);
    const accounts = await web3.eth.getAccounts();
    await contract.methods.updateNilai(mahasiswaAddr, matkul, nilaiBaru).send({ from: accounts[0] });
    document.getElementById("status").textContent = "✏️ Nilai berhasil diperbarui.";
}

async function handleHapusNilai() {
    const mahasiswaAddr = getAlamat();
    const matkul = document.getElementById("matkulHapus").value;
    const accounts = await web3.eth.getAccounts();
    await contract.methods.hapusNilai(mahasiswaAddr, matkul).send({ from: accounts[0] });
    document.getElementById("status").textContent = "🗑️ Nilai berhasil dihapus.";
}

async function handleLihatNilai() {
    const mahasiswaAddr = getAlamat();
    const data = await contract.methods.lihatNilai(mahasiswaAddr).call();
    tampilkanHasil(data);
}

async function handleFilterNilai() {
    const mahasiswaAddr = getAlamat();
    const nilaiMinimal = parseInt(document.getElementById("nilaiMinimal").value);
    const data = await contract.methods.filterNilai(mahasiswaAddr, nilaiMinimal).call();
    tampilkanHasil(data);
}

function tampilkanHasil(data) {
    const hasilList = document.getElementById("hasil");
    hasilList.innerHTML = "";
    if (data.length === 0) {
        hasilList.innerHTML = "<li>❌ Tidak ada data ditemukan.</li>";
    } else {
        data.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `📘 ${item.matkul} - ${item.nilai}`;
            hasilList.appendChild(li);
        });
    }
}

window.addEventListener("load", init);
