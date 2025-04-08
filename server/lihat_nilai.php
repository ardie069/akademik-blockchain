<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "akademik");

$mahasiswa = $_POST["mahasiswa"];

$stmt = $conn->prepare("SELECT mata_kuliah, nilai, tanggal_input FROM mahasiswa_nilai WHERE mahasiswa_address = ?");
$stmt->bind_param("s", $mahasiswa);
$stmt->execute();

$result = $stmt->get_result();
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
