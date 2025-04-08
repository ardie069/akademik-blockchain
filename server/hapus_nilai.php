<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "akademik");

$mahasiswa = $_POST["mahasiswa"];
$matkul = $_POST["matkul"];

$stmt = $conn->prepare("DELETE FROM mahasiswa_nilai WHERE mahasiswa_address = ? AND mata_kuliah = ?");
$stmt->bind_param("ss", $mahasiswa, $matkul);

$response = [];
if ($stmt->execute()) {
    $response["status"] = "success";
    $response["message"] = "Nilai berhasil dihapus.";
} else {
    $response["status"] = "error";
    $response["message"] = "Gagal menghapus nilai.";
}

echo json_encode($response);
?>
