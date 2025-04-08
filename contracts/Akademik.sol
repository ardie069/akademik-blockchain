// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Akademik {
    // ===== STRUCT =====
    struct Nilai {
        string matkul;
        uint nilai;
    }

    struct MataKuliah {
        string nama;
        address dosenPengampu;
    }

    // ===== ENUM & STATE =====
    enum Role {
        None,
        Mahasiswa,
        Dosen,
        Admin
    }

    address public owner;
    uint public jumlahMatkul;

    mapping(address => Role) public roles;
    mapping(string => MataKuliah) public daftarMatkul;
    mapping(address => uint[]) public krsMahasiswa;
    mapping(address => Nilai[]) private nilaiMahasiswa;

    // ===== EVENTS =====
    event NilaiDitambahkan(
        address indexed mahasiswa,
        string matkul,
        uint nilai
    );
    event NilaiDiperbarui(
        address indexed mahasiswa,
        string matkul,
        uint nilaiBaru
    );
    event NilaiDihapus(address indexed mahasiswa, string matkul);

    // ===== MODIFIER =====
    modifier onlyAdmin() {
        require(
            roles[msg.sender] == Role.Admin,
            "Hanya admin yang boleh mengakses ini!"
        );
        _;
    }

    modifier onlyDosenOrAdmin() {
        require(
            roles[msg.sender] == Role.Dosen || roles[msg.sender] == Role.Admin,
            "Hanya dosen atau admin yang boleh mengakses ini!"
        );
        _;
    }

    modifier onlyMahasiswa() {
        require(
            roles[msg.sender] == Role.Mahasiswa,
            "Hanya mahasiswa yang boleh mengakses ini!"
        );
        _;
    }

    // ===== KONSTRUKTOR =====
    constructor() {
        roles[msg.sender] = Role.Admin;
        owner = msg.sender;
    }

    // ===== FUNGSI BANTU =====
    function uintToString(uint v) internal pure returns (string memory str) {
        if (v == 0) {
            return "0";
        }
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - j - 1];
        }
        str = string(s);
    }

    function getMatkulById(uint _id) internal view returns (MataKuliah memory) {
        return daftarMatkul[uintToString(_id)];
    }

    // ===== MANAJEMEN ROLE & MATAKULIAH =====
    function setRole(address user, Role role) public onlyAdmin {
        roles[user] = role;
    }

    function tambahMatkul(
        string memory _nama,
        address _dosen
    ) public onlyAdmin {
        string memory idString = uintToString(jumlahMatkul);
        daftarMatkul[idString] = MataKuliah(_nama, _dosen);
        jumlahMatkul++;
    }

    // ===== FUNGSI KRS =====
    function isiKRS(uint _idMatkul) public onlyMahasiswa {
        require(_idMatkul < jumlahMatkul, "Mata kuliah tidak ditemukan!");

        for (uint i = 0; i < krsMahasiswa[msg.sender].length; i++) {
            require(
                krsMahasiswa[msg.sender][i] != _idMatkul,
                "Sudah mengisi KRS untuk matkul ini!"
            );
        }

        krsMahasiswa[msg.sender].push(_idMatkul);
    }

    function lihatKRS(
        address _mahasiswa
    ) public view returns (MataKuliah[] memory) {
        uint[] memory matkulIDs = krsMahasiswa[_mahasiswa];
        MataKuliah[] memory hasil = new MataKuliah[](matkulIDs.length);

        for (uint i = 0; i < matkulIDs.length; i++) {
            hasil[i] = getMatkulById(matkulIDs[i]);
        }

        return hasil;
    }

    // ===== FUNGSI NILAI =====
    function tambahNilai(
        address _mahasiswa,
        uint _idMatkul,
        uint _nilai
    ) public {
        require(_idMatkul < jumlahMatkul, "Matkul tidak ditemukan");

        MataKuliah memory matkul = getMatkulById(_idMatkul);
        require(
            msg.sender == matkul.dosenPengampu ||
                roles[msg.sender] == Role.Admin,
            "Bukan dosen pengampu"
        );

        // Cek KRS
        bool terdaftar = false;
        for (uint i = 0; i < krsMahasiswa[_mahasiswa].length; i++) {
            if (krsMahasiswa[_mahasiswa][i] == _idMatkul) {
                terdaftar = true;
                break;
            }
        }
        require(terdaftar, "Mahasiswa tidak mengambil matkul ini");

        nilaiMahasiswa[_mahasiswa].push(Nilai(matkul.nama, _nilai));
        emit NilaiDitambahkan(_mahasiswa, matkul.nama, _nilai);
    }

    function lihatNilai(
        address _mahasiswa
    ) public view returns (Nilai[] memory) {
        return nilaiMahasiswa[_mahasiswa];
    }

    function updateNilai(
        address _mahasiswa,
        string memory _matkul,
        uint _nilaiBaru
    ) public onlyDosenOrAdmin {
        for (uint i = 0; i < nilaiMahasiswa[_mahasiswa].length; i++) {
            if (
                keccak256(bytes(nilaiMahasiswa[_mahasiswa][i].matkul)) ==
                keccak256(bytes(_matkul))
            ) {
                nilaiMahasiswa[_mahasiswa][i].nilai = _nilaiBaru;
                emit NilaiDiperbarui(_mahasiswa, _matkul, _nilaiBaru);
                return;
            }
        }
    }

    function hapusNilai(
        address _mahasiswa,
        string memory _matkul
    ) public onlyDosenOrAdmin {
        uint length = nilaiMahasiswa[_mahasiswa].length;
        for (uint i = 0; i < length; i++) {
            if (
                keccak256(bytes(nilaiMahasiswa[_mahasiswa][i].matkul)) ==
                keccak256(bytes(_matkul))
            ) {
                nilaiMahasiswa[_mahasiswa][i] = nilaiMahasiswa[_mahasiswa][
                    length - 1
                ];
                nilaiMahasiswa[_mahasiswa].pop();
                emit NilaiDihapus(_mahasiswa, _matkul);
                return;
            }
        }
    }

    function filterNilai(
        address _mahasiswa,
        uint nilaiMinimal
    ) public view returns (Nilai[] memory) {
        uint count = 0;
        for (uint i = 0; i < nilaiMahasiswa[_mahasiswa].length; i++) {
            if (nilaiMahasiswa[_mahasiswa][i].nilai >= nilaiMinimal) {
                count++;
            }
        }

        Nilai[] memory hasil = new Nilai[](count);
        uint index = 0;
        for (uint i = 0; i < nilaiMahasiswa[_mahasiswa].length; i++) {
            if (nilaiMahasiswa[_mahasiswa][i].nilai >= nilaiMinimal) {
                hasil[index] = nilaiMahasiswa[_mahasiswa][i];
                index++;
            }
        }

        return hasil;
    }
}
