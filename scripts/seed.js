const { createClient } = require('@supabase/supabase-js');

// Mengambil variabel lingkungan dari .env.local (membutuhkan Node.js v20+ dengan flag --env-file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan.");
  console.error("Pastikan Anda menjalankan script ini dengan: node --env-file=.env.local scripts/seed.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSeed() {
  console.log("🌱 Memulai proses seeding database...");

  try {
    // 1. Buat User Dummy
    console.log("1️⃣ Membuat user demo...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@pdfpro.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Demo User' }
    });

    if (authError) {
      if (authError.message.includes('already')) {
         console.log("⚠️ User demo@pdfpro.com sudah ada. Melanjutkan dengan user ini...");
      } else {
         throw new Error(`Gagal membuat user: ${authError.message}`);
      }
    }

    // Ambil ID User
    let userId;
    if (authData?.user) {
      userId = authData.user.id;
    } else {
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', 'demo@pdfpro.com').single();
      if (!existingUser) throw new Error("Gagal menemukan user demo.");
      userId = existingUser.id;
    }

    console.log(`✅ User ID: ${userId}`);

    // Hapus data lama jika ada
    await supabase.from('subscriptions').delete().eq('user_id', userId);
    await supabase.from('pdf_history').delete().eq('user_id', userId);
    await supabase.from('usage_stats').delete().eq('user_id', userId);

    // 2. Tambahkan Subscription (Pro Plan)
    console.log("2️⃣ Menambahkan data langganan (Pro Plan)...");
    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: userId,
      plan: 'pro',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (subError) throw new Error(`Gagal menambah langganan: ${subError.message}`);

    // 3. Tambahkan Riwayat PDF (pdf_history)
    console.log("3️⃣ Menambahkan riwayat pemrosesan PDF...");
    const dummyHistory = [
      {
        user_id: userId,
        tool_used: 'Split',
        file_name: 'laporan_tahunan_2023.pdf',
        file_size: 2500000, // 2.5 MB
        pages_count: 50,
        processing_time: 1200, // 1.2 detik
        success: true
      },
      {
        user_id: userId,
        tool_used: 'Merge',
        file_name: 'gabungan_dokumen.pdf',
        file_size: 4100000, // 4.1 MB
        pages_count: 12,
        processing_time: 2500,
        success: true
      },
      {
        user_id: userId,
        tool_used: 'Compress',
        file_name: 'presentasi_marketing.pdf',
        file_size: 15000000, // 15 MB
        pages_count: 30,
        processing_time: 4500,
        success: true
      }
    ];

    const { error: histError } = await supabase.from('pdf_history').insert(dummyHistory);
    if (histError) console.log(`⚠️ Gagal menambah riwayat: ${histError.message}`);

    // 4. Tambahkan Statistik Penggunaan (usage_stats)
    console.log("4️⃣ Menambahkan statistik penggunaan bulanan...");
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01
    const { error: statError } = await supabase.from('usage_stats').insert({
      user_id: userId,
      month: currentMonth,
      pdf_count: 3,
      total_size: 21600000 // Total file_size
    });

    if (statError) throw new Error(`Gagal menambah statistik: ${statError.message}`);

    console.log("🎉 Seeding Selesai! Anda sekarang memiliki data dummy untuk dasbor.");
    console.log("\nAnda bisa login dengan:");
    console.log("Email: demo@pdfpro.com");
    console.log("Password: password123");

  } catch (error) {
    console.error("❌ Terjadi kesalahan saat seeding:", error.message);
  }
}

runSeed();
