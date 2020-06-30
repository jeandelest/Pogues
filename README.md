<img align="right" src="docs/img/pogues-logo.png" alt="Pogues logo"/>

# Pogues

Pogues is a questionnaire design and test tool.

[![Build Status](https://travis-ci.org/InseeFr/Pogues.svg?branch=master)](https://travis-ci.org/InseeFr/Pogues)
[![Coverage Status](https://coveralls.io/repos/github/InseeFr/Pogues/badge.svg?branch=master)](https://coveralls.io/github/InseeFr/Pogues?branch=master)

The developer documentation can be found in the [doc](https://github.com/InseeFr/Pogues/tree/master/doc) folder and [browsed online](http://inseefr.github.io/Pogues).

## The new features available are : 

-**Redirect towards the end of the questionnaire...** The list of possible targets in the Redirections tab now includes the QUESTIONNAIRE_END modality which allows you to indicate that you want to redirect the respondent towards the end of the questionnaire ;

-**Other, specify ...** It is now possible to specify by a text complement the check mark of a "Other" modality for a question calling a single choice or multiple choice answer or for a column of a fixed size table calling a single choice answer.
To do this, click on "see in detail" for the question concerned in Pogues then click on the + icon of the modality for which you wish to trigger this text complement, modify the length (by default 249 characters) and the label of the field (by default "Specify:") if necessary, then generate the collected variables and modify the identifiers and labels generated by default if necessary.
It is also possible to modify or delete these text additions;

-**Format and date limits...** For a simple date-type answer, it is now possible to choose from : 
-a date in the format "day month year" YYYY-MM-DD (presented on the web questionnaire as before by a calendar and a display in the format DD/MM/YYYY) and to indicate if necessary the minimum and maximum limits desired (knowing that by default the system considers a minimum at 01/01/1900 (i.e. at 1900-01-01) and a maximum at the current date);
-a date in "month/year" format YYYYY-MM and, if necessary, indicate the desired minimum and maximum limits (by default the minimum is 1900-01 and the maximum is the current month and year);
- a date in the format year YYYYY and to indicate if necessary the desired minimum and maximum limits (by default the minimum is at 1900 and the maximum at the current year).

-**Duration...** It is now possible to specify a simple duration response among the formats :
-duration in years/months and, if necessary, indicate the minimum and maximum limits required (by default the minimum is 0 years and 0 months (P0Y0M) and the maximum is 99 years and 11 months (P99Y11M));
-duration in hours/minutes and, if required, indicate the desired minimum and maximum limits (by default the minimum is 0 hours 0 minutes (PT0H0M) and the maximum is 99 hours 59 minutes (PT99H59M));
-duration in hours/hundredths and to indicate if necessary the desired minimum and maximum limits (by default the minimum is at 00:00 and the maximum at 99:99).

-**Negative minimum within a table ...** It is now possible to indicate a negative bound for a column of numerical responses within a table;

-**Management of uncollected cells in a table...** In the Collected Variables tab, a Collected boolean (checked by default) allows you to indicate the cells of a table that you do not wish to collect (grayed cell or total cell for example that can be replaced manually by 100% or a calculated or collected value that you will indicate);

-**Maximum number of rows in a dynamic table ...** Until now, the maximum number of rows in a dynamic table was limited to 100 in the Pogues entry. It is now limited to 300 ;

-**To be able to associate a tooltip with a table column label...**

-**External and calculated variables: taking into account variable formats...** This will solve some formula bugs currently encountered. The syntaxes to be used for the different types of variables are recalled in the online user guide, accessible via the help button ;

-**Some ergonomic evolutions ...**

By default, for answers associated to a code list, the button specify code list will now be set to "Create a list". You can therefore view the code list directly, without having to change its position within "Specify the list", in order to consult and possibly modify it (many users were regularly trapped by the current ergonomics and did not know how to consult the code list associated with the answer and were afraid of losing their previously created code list by manually positioning the button on "Create a list"). 

Furthermore, when searching for a list within the questionnaire, the drop-down list of available code lists will now be sorted in alphabetical order of the list label.
In cases where the regeneration of the collected variables is indispensable (modification of the response format for example), the application now requires you to regenerate the collected variables.

At last, the application now alerts you when you ask to exit the survey without first saving your last changes or when saving is impossible due to the loss of your user session (reminder: reconnect to Pogues in a new tab of your browser, go back to the previous tab and click Save again!). 

