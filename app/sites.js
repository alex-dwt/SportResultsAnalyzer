/*
 * This file is part of the SportResultsAnalyzer package.
 * (c) Alexander Lukashevich <aleksandr.dwt@gmail.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

const SITE_URL = process.env.SITE_URL;

module.exports = {
    sports: {
        basketball:  {
            urls: [
                {id: '79', urls:['/', '/', '/']},
                {id: '2', urls:['/', '/', '/']},
                {id: '1', urls:['/', '/', '/']},
                {id: '3', urls:['/', '/', '/']},
                {id: '7', urls:['/', '/', '/']},
                {id: '9', urls:['/', '/', '/']},
                {id: '15', urls:['/', '/', '/']},
                {id: '8', urls:['/', '/', '/']},
                {id: '36', urls:['/', '/', '/']},
                {id: '58', urls:['/', '/', '/']},
                // {id: '186', urls:['/', '/', '/']},
                {id: '15', urls:['/', '/', '/']},
                {id: '13', urls:['/', '/', '/']},
            ],
            archive: [
                {id: '6302r'},
                {id: '6320r'},
                {id: '6430r'},
                {id: '6289r'},
                {id: '6293r'},
                {id: '6230r'},
                {id: '6648r'},
                {id: '6664r'},
                {id: '6271r'},
                {id: '6316r'},
                {id: '6307r'},
                {id: '8172r'},
            ],
        },
        soccer: {
            urls: [
                {id: '216', urls:['/v3/ru/line/bets/period=0;chmp=a:11168;', '/su/betting/Football/Saudi+Arabia/Pro+League/', '/sport/futbol/saudovskaja-aravija-pro-liga']},
                {id: '61', urls:['/v3/ru/line/bets/period=0;chmp=a:5367;', '/su/betting/Football/Croatia/1st+League/', '/sport/futbol/khorvatija-liga-1']},
                {id: '64', urls:['/v3/ru/line/bets/period=0;chmp=a:16261;', '/su/betting/Football/Bosnia+and+Herzegovina/Premier+League/', '/sport/futbol/bosnija-i-gercegovina-premer-liga']},
                {id: '90', urls:['/v3/ru/line/bets/period=0;chmp=a:9876;', '/su/betting/Football/Chile/Primera+Division/', '/sport/futbol/chili-primera-divizion']},
                {id: '15', urls:['/v3/ru/line/bets/period=0;chmp=a:97;', '/su/betting/Football/England/League+1/', '/sport/futbol/anglija-liga-1']},
                {id: '32', urls:['/v3/ru/line/bets/period=0;chmp=a:7859;', '/su/betting/Football/England/League+2/', '/sport/futbol/anglija-liga-2']},
                {id: '8', urls:['/v3/ru/line/bets/period=0;chmp=a:445;', '/su/betting/Football/England/Premier+League/', '/sport/futbol/anglija-premer-liga']},
                {id: '122', urls:['/v3/ru/line/bets/period=0;chmp=a:11854;', '/su/betting/Football/Russia/FNL/', '/sport/futbol/rossija-fnl']},
                {id: '70', urls:['/v3/ru/line/bets/period=0;chmp=a:24;', '/su/betting/Football/England/Championship/', '/sport/futbol/anglija-chempionship']},
                {id: '440', urls:['/v3/ru/line/bets/period=0;chmp=a:11163;', '/su/betting/Football/Serbia/SuperLiga/', '/sport/futbol/serbija-superliga']},
                {id: '67', urls:['/v3/ru/line/bets/period=0;chmp=a:3807;', '/su/betting/Football/Hungary/NB+I/', '/sport/futbol/vengrija-liga-nb-i']},
                {id: '68', urls:['/v3/ru/line/bets/period=0;chmp=a:55979;', '/su/betting/Football/Hungary/NB+II/', '/sport/futbol/vengrija-liga-nb-ii']},
                {id: '24', urls:['/v3/ru/line/bets/period=0;chmp=a:3507;', '/su/betting/Football/Belgium/1st+Division+A/', '/sport/futbol/belgija-pervyjj-divizion-a']},
                {id: '59', urls:['/v3/ru/line/bets/period=0;chmp=a:8873;', '/su/betting/Football/Bulgaria/1st+League/', '/sport/futbol/bolgarija-gruppa-a']},
                {id: '39', urls:['/v3/ru/line/bets/period=0;chmp=a:6460;', '/su/betting/Football/Denmark/1st+Division/', '/sport/futbol/danija-pervyjj-divizion']},
                {id: '119', urls:['/v3/ru/line/bets/period=0;chmp=a:5480;', '/su/betting/Football/Poland/Ekstraklasa/', '/sport/futbol/polsha-ekstraklasa']},
                {id: '120', urls:['/v3/ru/line/bets/period=0;chmp=a:12837;', '/su/betting/Football/Poland/I+Liga/', '/sport/futbol/polsha-liga-1']},
                {id: '16', urls:['/v3/ru/line/bets/period=0;chmp=a:433;', '/su/betting/Football/France/Ligue+1/', '/sport/futbol/francija-liga-1']},
                {id: '17', urls:['/v3/ru/line/bets/period=0;chmp=a:432;', '/su/betting/Football/France/Ligue+2/', '/sport/futbol/francija-liga-2']},
                {id: '121', urls:['/v3/ru/line/bets/period=0;chmp=a:74979;', '/su/betting/Football/Russia/Premier+League/', '/sport/futbol/rossija-premer-liga']},
                {id: '49', urls:['/v3/ru/line/bets/period=0;chmp=a:13097;', '/su/betting/Football/Austria/Bundesliga/', '/sport/futbol/avstrija-bundesliga']},
                {id: '123', urls:['/v3/ru/line/bets/period=0;chmp=a:2737;', '/su/betting/Football/Slovakia/Fortuna+Liga/', '/sport/futbol/slovakija-superliga']},
                {id: '86', urls:['/v3/ru/line/bets/period=0;chmp=a:3045;', '/su/betting/Football/Slovenia/1st+League/', '/sport/futbol/slovenija-liga-1']},
                {id: '125', urls:['/v3/ru/line/bets/period=0;chmp=a:2737;', '/su/betting/Football/Ukraine/Premier+League/', '/sport/futbol/ukraina-premer-liga']},
                {id: '82', urls:['/v3/ru/line/bets/period=0;chmp=a:10298;', '/su/betting/Football/Czech+Republic/1st+League/', '/sport/futbol/chekhija-pervaja-liga']},
                {id: '83', urls:['/v3/ru/line/bets/period=0;chmp=a:10622;', '/su/betting/Football/Czech+Republic/FNL/', '/sport/futbol/chekhija-fnl']},
                {id: '27', urls:['/v3/ru/line/bets/period=0;chmp=a:1266;', '/su/betting/Football/Switzerland/Super+League/', '/sport/futbol/shvejjcarija-superliga']},
                {id: '117', urls:['/v3/ru/line/bets/period=0;chmp=a:9077;', '/su/betting/Football/Israel/Premier+League/', '/sport/futbol/izrail-premer-liga']},
                {id: '1', urls:['/v3/ru/line/bets/period=0;chmp=a:15;', '/su/betting/Football/Netherlands/Eredivisie/', '/sport/futbol/niderlandy-eredivisie']},
                {id: '5', urls:['/v3/ru/line/bets/period=0;chmp=a:6315;', '/su/betting/Football/Netherlands/Eerste+Divisie/', '/sport/futbol/niderlandy-pervyjj-divizion']},
                {id: '66', urls:['/v3/ru/line/bets/period=0;chmp=a:11953;', '/su/betting/Football/Belarus/Vysshaya+League/', '/sport/futbol/belarus-vysshaja-liga']},
                {id: '89', urls:['/v3/ru/line/bets/period=0;chmp=a:16500;', '/su/betting/Football/Brazil/Serie+B/', '/sport/futbol/brazilija-serija-v']},
                {id: '26', urls:['/v3/ru/line/bets/period=0;chmp=a:1471;', '/su/betting/Football/Brazil/Serie+A/', '/sport/futbol/brazilija-serija-a']},
                {id: '629', urls:['/v3/ru/line/bets/period=0;chmp=a:101509;', '/su/betting/Football/Indonesia/Liga+1/', '/sport/futbol/indonezija-chempionat-a']},
                {id: '51', urls:['/v3/ru/line/bets/period=0;chmp=a:12079;', '/su/betting/Football/China+PR/Super+League/', '/sport/futbol/kitajj-super-liga']},
                {id: '29', urls:['/v3/ru/line/bets/period=0;chmp=a:2291;', '/su/betting/Football/Norway/Eliteserien/', '/sport/futbol/norvegija-ehlitserija']},
                {id: '22', urls:['/v3/ru/line/bets/period=0;chmp=a:1815;', '/su/betting/Football/Finland/Veikkausliiga/', '/sport/futbol/finljandija-veikkausliiga']},
                {id: '35', urls:['/v3/ru/line/bets/period=0;chmp=a:10565;', '/su/betting/Football/Finland/Ykkonen/', '/sport/futbol/finljandija-ykkonen']},
                {id: '28', urls:['/v3/ru/line/bets/period=0;chmp=a:1222;', '/su/betting/Football/Sweden/Allsvenskan/', '/sport/futbol/shvecija-allsvenskan']},
                {id: '37', urls:['/v3/ru/line/bets/period=0;chmp=a:11445;', '/su/betting/Football/Sweden/Superettan/', '/sport/futbol/shvecija-superettan']},
                {id: '109', urls:['/v3/ru/line/bets/period=0;chmp=a:11633;', '/su/betting/Football/Japan/J.League/Division+1/', '/sport/futbol/japonija-j1-liga']},
                {id: '30', urls:['/v3/ru/line/bets/period=0;chmp=a:1321;', '/su/betting/Football/Denmark/Superliga/', '/sport/futbol/danija-superliga']},
                {id: '31', urls:['/', '/', '/']},
                {id: '34', urls:['/', '/', '/']},
                {id: '136', urls:['/', '/', '/']},
                {id: '38', urls:['/', '/', '/']},
                {id: '76', urls:['/', '/', '/']},
            ],
            archive: [
                {id: '39336r'},
                {id: '12094s'},
                {id: '12073s'},
                {id: '12284s'},
                {id: '12254s'},
                {id: '12196s'},
                {id: '34146r'},
                {id: '12166s'},
                {id: '12653s'},
                {id: '36638r'},
                {id: '12593s'},
                {id: '12594s'},
                {id: '12612s'},
                {id: '37748r'},
                {id: '12659s'},
                {id: '37192r'},
                {id: '12611s'},
                {id: '12608s'},
                {id: '39809r'},
                {id: '39625r'},
                {id: '39745r'},
                {id: '41670r'},
                {id: '42369r'},
                {id: '45776r'},
                {id: '45787r'},
                {id: '14062s'},
                {id: '14019s'},
                {id: '13833s'},
                {id: '14277s'},
                {id: '42487r'},
                {id: '14230s'},
                {id: '42016r'},
                {id: '42672r'},
                {id: '14018r'},
                {id: '42073r'},
                {id: '14029s'},
                {id: '14038s'},
                {id: '12737s'},
                {id: '42070r'},
                {id: '41605r'},
                {id: '36655r'},
                {id: '14182s'},
                {id: '12517s'},
                {id: '14339s'},
                {id: '12908s'},
                {id: '41608r'},
                {id: '36668r'},
                {id: '42667r'},
                {id: '36871r'},
                {id: '14212s'},
                {id: '12873s'},
                {id: '12789s'},
                {id: '42329r'},
                {id: '35890r'},
                {id: '14318s'},
                {id: '12901s'},
                {id: '14060s'},
                {id: '41647r'},
                {id: '14090s'},
                {id: '12739s'},
                {id: '14173s'},
                {id: '12618s'},
                {id: '42021r'},
                {id: '12744s'},
                {id: '14129s'},
                {id: '12742s'},
                {id: '42443r'},
                {id: '35893r'},
                {id: '14337s'},
                {id: '12886s'},
                {id: '14183s'},
                {id: '12617s'},
                {id: '14193s'},
                {id: '12846s'},
                {id: '14284s'},
                {id: '12758s'},
                {id: '14007s'},
                {id: '14008s'},
                {id: '14009s'},
                {id: '12607s'},
                {id: '14369s'},
                {id: '36670r'},
                {id: '14535s'},
                {id: '13022s'},
                {id: '41565r'},
                {id: '36479r'},
                {id: '14018s'},
                {id: '42973r'},
                {id: '14181s'},
                {id: '13686s'},
                {id: '12463s'},
                {id: '42274r'},
                {id: '36385r'},
                {id: '13843s'},
                {id: '12507s'},
                {id: '13953s'},
                {id: '12480s'},
                {id: '14255s'},
                {id: '12761s'},
            ],
        },
    },

    createUrl(sport, tournamentId, isMatchesUrl) {
        let result = `${SITE_URL}/?sport=${sport}&id=${parseInt(tournamentId.replace('a', ''))}&page=`;
        if (tournamentId.indexOf('r') !== -1) {
            result += 'round';
        } else if (tournamentId.indexOf('s') !== -1) {
            result += 'season';
        } else {
            result += 'competition';
        }
        if (isMatchesUrl) {
            result += '&view=matches';
        }

        return result;
    }
};
