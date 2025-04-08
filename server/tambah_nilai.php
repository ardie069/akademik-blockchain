<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$db = "akademik";

$conn = new mysqli($host, $user, $pass, $db);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mahasiswa = $_POST['mahasiswa'];
    $matkul = $_POST['matkul'];
    $nilai = $_POST['nilai'];

    $stmt = $conn->prepare("INSERT INTO mahasiswa_nilai (mahasiswa_address, mata_kuliah, nilai) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $mahasiswa, $matkul, $nilai);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
?>
