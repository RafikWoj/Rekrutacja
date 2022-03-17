const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/') {

        d = new Date();
        res.write(d.toString());
        res.end();
    }
    else if (req.url.startsWith('/time?zone')) {

        process.env.TZ = 'Europe/Warsaw';

        parts = req.url.split('=');
        z = parts[1];

        zone = 'GMT+'
        isDecreasing = false;
        if (z.startsWith('M')) {
            zone = 'GMT-';
            z = z.replace('M', '');
            isDecreasing = true;
        }

        //mo¿na zrobiæ ograniczenie, ¿e tylko w ramach doby zmieniamy strefê, ale mo¿na te¿ dodawaæ/odejmowaæ dni.... tak zrobi³em
        /*if (i > 23 || i < 0) {
            res.write('Parametr musi zawieraæ siê w zakresie [M]0 - [M]23.');
        }
        else*/
        if (isNaN(z)) {
            res.write('Parametr musi byæ liczb¹ ca³kowit¹ dodatni¹ lub liczb¹ ca³kowit¹ poprzedzon¹ znakiem M dla liczb ujemnych.');
        }
        else
        {
            operationdescription = '';
            i = parseInt(z, 10);
            daystoadd = Math.floor(i / 24);
            if (isDecreasing) {
                daystoadd = daystoadd * (-1);
                operationdescription = 'odjêtych';
            }
            else
                operationdescription = 'dodanych';

            //obliczenie liczby godzin z pominiêciem przesuniêcia w dniach
            z = (i - (24 * Math.abs(daystoadd))).toString();

            daysToAddStr = '';
            if (daystoadd!=0)
                daysToAddStr = ` (liczba ${operationdescription} dni: ${Math.abs(daystoadd)})`;

            if (z.length === 1)
                z = '0' + z;
            zone = zone + z;

            d = new Date();

            //aby zaprezentowaæ, o ile lokalny czas przesuniêty jest w stosunku do GMT
            strdate = d.toString();
            pos = strdate.indexOf('GMT');
            localzone = strdate.substring(pos, pos + 6);

            s = '<p> Aktualne data i czas (' + localzone + '): <b>' + d.toLocaleString('pl-pl') + '</b></p>';

            //zmiana strefy czasowej
            process.env.TZ = zone;

            d1 = new Date();
            //dodanie/odjêcie dni wynikaj¹ce z parametru>23
            d1.setDate(d1.getDate() + daystoadd);

            res.write('<html>');
            res.write('<h1>Data i czas</h1>');
            res.write(s);
            res.write('<p> Data i czas w strefie ' + zone + ': <b>' + d1.toLocaleString('pl-pl')+ '</b>' + daysToAddStr + '</p>');
            res.write('</html>');
        }


        res.end();
    }
});

server.listen('1234');

console.log('Nas³uchujê port 1234....');