const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
	// set some options (set headless to false so we can see 
	// this automated browsing experience)
	let launchOptions = { headless: false };
	
	// let's go to the BCA internet banking website
	const browser = await puppeteer.launch(launchOptions);
	const page = await browser.newPage();
	await page.goto('https://ibank.klikbca.com');

	// do the login
	await page.type('#user_id', process.env.KLIKBCA_USER);
	await page.waitFor(1000);
	await page.type('#pswd', process.env.KLIKBCA_PASSWORD);
	await page.waitFor(1000);
	await page.waitForSelector('input[value="LOGIN"]');
	await page.click('input[value="LOGIN"]');
	await page.waitFor(3000);

	// doing click on left menu, account information, 
	// this menu is inside an iframe
	var frame = page.frames().find(fr => fr.name() === 'menu');
	await frame.waitForSelector('a[href="account_information_menu.htm"]');
	await frame.click('a[href="account_information_menu.htm"]');
	await frame.waitFor(3000);

	// doing click again on left menu, balance inquiry, 
	// this menu is still inside an iframe	
	await frame.evaluate(() => document.querySelectorAll('table')[2].querySelectorAll('tr')[0].querySelectorAll('td')[1].querySelector('a').click());
	await frame.waitFor(3000);

	// now go to iframe that display the balance (on the right side)
	// and scrape the balance data there
	frame = page.frames().find(fr => fr.name() === 'atm');
	const balanceInfo = await frame.evaluate(() => {
		return {
			    'account_no': document.querySelectorAll('table')[2].querySelectorAll('tr')[1].querySelectorAll('td')[0].textContent.trim(),
				'account_type': document.querySelectorAll('table')[2].querySelectorAll('tr')[1].querySelectorAll('td')[1].textContent.trim(),
				'currency': document.querySelectorAll('table')[2].querySelectorAll('tr')[1].querySelectorAll('td')[2].textContent.trim(),
			   	'balance': document.querySelectorAll('table')[2].querySelectorAll('tr')[1].querySelectorAll('td')[3].textContent.trim(),
			   }
	});
	await frame.waitFor(3000);

	// display BCA balance (plus account number, account type and currency type)
  	console.log(balanceInfo);

	await browser.close();
})();