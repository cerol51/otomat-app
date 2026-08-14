const { taskiMachines } = require('./src/components/admin/taskiData.js');

function calc(aktifMakine) {
    const pratikFaktor = 0.8;
    const teorik = parseFloat(aktifMakine.teorikPerformans) || parseFloat(aktifMakine.m2) || 0;
    const pratikM2_normal = parseFloat(aktifMakine.pratikPerformans) || (teorik * pratikFaktor);
    let akuKapasitesi;
    if (aktifMakine.surus === 'Kablolu') {
        akuKapasitesi = 99;
    } else {
        akuKapasitesi = parseFloat(aktifMakine.tekSarjSure?.toString().replace(',', '.')) || parseFloat(aktifMakine.aku?.toString().replace(',', '.')) || 1;
    }
    const yasFaktoru = 0.95;
    const yipranmisAku = akuKapasitesi >= 99 ? 99 : (akuKapasitesi * yasFaktoru);
    const maxYikamaKapasitesi = pratikM2_normal * yipranmisAku;
    return { name: aktifMakine.model, pratik: Math.round(pratikM2_normal), tekSarj: Math.round(maxYikamaKapasitesi) };
}

console.log(calc(taskiMachines[0])); // Swingo 150 B
console.log(calc(taskiMachines[3])); // Swingo 455 B
