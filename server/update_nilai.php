<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "akademik");

$mahasiswa = $_POST["mahasiswa"];
$matkul = $_POST["matkul"];
$nilai = $_POST["nilai"];

$stmt = $conn->prepare("UPDATE mahasiswa_nilai SET nilai = ? WHERE mahasiswa_address = ? AND mata_kuliah = ?");
$stmt->bind_param("iss", $nilai, $mahasiswa, $matkul);

$response = [];
if ($stmt->execute()) {
    $response["status"] = "success";
    $response["message"] = "Nilai berhasil diperbarui.";
} else {
    $response["status"] = "error";
    $response["message"] = "Gagal memperbarui nilai.";
}

echo json_encode($response);
?>
