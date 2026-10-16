<?php
/**
 * EXAMIND — Native XAMPP Entrypoint
 * Mengarahkan akses Apache langsung ke bundle Vue 3 native tanpa perlu menjalankan npm
 */
header("Location: dist/");
exit;
