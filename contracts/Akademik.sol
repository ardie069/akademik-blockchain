// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Akademik {
    struct Nilai {
        string matkul;
        uint nilai;
    }

    mapping(address => Nilai[]) private nilaiMahasiswa;
    event NilaiDitambahkan(address indexed mahasiswa, string matkul, uint nilai);
    event NilaiDiperbarui(address indexed mahasiswa, string matkul, uint nilaiBaru);
    event NilaiDihapus(address indexed mahasiswa, string matkul);

    function tambahNilai(address _mahasiswa, string memory _matkul, uint _nilai) public {
        nilaiMahasiswa[_mahasiswa].push(Nilai(_matkul, _nilai));
        emit NilaiDitambahkan(_mahasiswa, _matkul, _nilai);
    }

    function lihatNilai(address _mahasiswa) public view returns (Nilai[] memory) {
        return nilaiMahasiswa[_mahasiswa];
    }

    function updateNilai(address _mahasiswa, string memory _matkul, uint _nilaiBaru) public {
        for (uint i = 0; i < nilaiMahasiswa[_mahasiswa].length; i++) {
            if (keccak256(bytes(nilaiMahasiswa[_mahasiswa][i].matkul)) == keccak256(bytes(_matkul))) {
                nilaiMahasiswa[_mahasiswa][i].nilai = _nilaiBaru;
                emit NilaiDiperbarui(_mahasiswa, _matkul, _nilaiBaru);
                return;
            }
        }
    }

    function hapusNilai(address _mahasiswa, string memory _matkul) public {
        uint length = nilaiMahasiswa[_mahasiswa].length;
        for (uint i = 0; i < length; i++) {
            if (keccak256(bytes(nilaiMahasiswa[_mahasiswa][i].matkul)) == keccak256(bytes(_matkul))) {
                nilaiMahasiswa[_mahasiswa][i] = nilaiMahasiswa[_mahasiswa][length - 1];
                nilaiMahasiswa[_mahasiswa].pop();
                emit NilaiDihapus(_mahasiswa, _matkul);
                return;
            }
        }
    }

    function filterNilai(address _mahasiswa, uint nilaiMinimal) public view returns (Nilai[] memory) {
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
