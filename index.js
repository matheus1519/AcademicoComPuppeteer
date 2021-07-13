require("dotenv").config();
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://academico.iff.edu.br/qacademico/index.asp?t=1001");
  await page.type("#txtLogin", process.env.MATRICULA);
  await page.type("#txtSenha", process.env.SENHA);
  await Promise.all([page.click("#btnOk"), page.waitForNavigation()]);
  await page.goto("https://academico.iff.edu.br/qacademico/index.asp?t=2071");

  let disciplines = await page.$$eval(
    "body > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table:nth-child(3) > tbody > tr > td:nth-child(2) > p > table:nth-child(3) > tbody strong",
    (discs) => discs.map((disc) => disc.textContent)
  );

  let disciplinesFormatted = dealWith(disciplines);

  disciplinesFormatted.forEach((discipline) =>
    console.log(
      `${discipline.teacher} leciona a matéria de ${discipline.discipline}`
    )
  );

  browser.close();
})();

function dealWith(disciplines) {
  disciplinesFormatted = disciplines.map((discipline) => {
    removeBreakLine = discipline.replace(/(\r\n|\n|\r)/gm, "");
    removeExtraWhiteSpace = removeBreakLine.replace(/\s+/g, " ").trim();
    fragmentData = removeExtraWhiteSpace.split(" - ");
    removeWorkload = [fragmentData[2].split("(")[0], fragmentData[3]];
    convertedToObject = {
      discipline: removeWorkload[0],
      teacher: removeWorkload[1],
    };
    return convertedToObject;
  });

  return disciplinesFormatted;
}
