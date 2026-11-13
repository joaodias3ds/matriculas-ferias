const limit = 30;
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const clean = (value, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const digits = value => value.replace(/\D/g, '');
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/availability' && request.method === 'GET') {
      const row = await env.DB.prepare('SELECT COUNT(*) AS total FROM enrollments').first();
      return json({ remaining: Math.max(0, limit - row.total), total: limit });
    }
    if (url.pathname === '/api/enroll' && request.method === 'POST') {
      let input;
      try { input = await request.json(); } catch { return json({ error: 'Confira os dados e tente novamente.' }, 400); }
      const name = clean(input.name), birthDate = clean(input.birthDate, 10), email = clean(input.email, 254).toLowerCase(), phone = digits(clean(input.phone, 30));
      const guardianName = clean(input.guardianName), guardianPhone = digits(clean(input.guardianPhone, 30));
      const school = clean(input.school), notes = clean(input.notes, 500);
      const birth = new Date(`${birthDate}T12:00:00Z`);
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(birthDate) && !Number.isNaN(birth.getTime()) && birth.toISOString().slice(0, 10) === birthDate && birth <= new Date();
      const age = validDate ? (Date.now() - birth.getTime()) / 31557600000 : 0;
      if (name.length < 3 || !validDate || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 10 || phone.length > 11 || (age < 18 && (guardianName.length < 3 || guardianPhone.length < 10)) || input.consent !== true) return json({ error: 'Preencha os campos obrigatórios para confirmar a matrícula.' }, 400);
      const code = crypto.randomUUID().slice(0, 8).toUpperCase();
      try {
        const result = await env.DB.prepare(`INSERT INTO enrollments (code,name,birth_date,email,phone,guardian_name,guardian_phone,school,notes,consent)
          SELECT ?,?,?,?,?,?,?,?,?,1 WHERE (SELECT COUNT(*) FROM enrollments) < ?`)
          .bind(code, name, birthDate, email, phone, guardianName, guardianPhone, school, notes, limit).run();
        if (!result.meta.changes) return json({ error: 'As 30 vagas já foram preenchidas.' }, 409);
        return json({ code, name, remaining: Math.max(0, limit - (await env.DB.prepare('SELECT COUNT(*) AS total FROM enrollments').first()).total) }, 201);
      } catch (error) {
        if (String(error).includes('UNIQUE')) return json({ error: 'Este e-mail já tem uma matrícula confirmada.' }, 409);
        return json({ error: 'Não foi possível confirmar agora. Tente novamente.' }, 500);
      }
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'Página não encontrada.' }, 404);
    return env.ASSETS.fetch(request);
  }
};
