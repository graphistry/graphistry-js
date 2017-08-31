import React from 'react';
import uuidv4 from 'uuid/v4';
import PropTypes from 'prop-types';
import shallowEqual from 'recompose/shallowEqual';
import mapPropsStream from 'recompose/mapPropsStream';
import createEventHandler from 'recompose/createEventHandler';
import { GraphistryJS } from '@graphistry/client-api';
const { Observable } = GraphistryJS;
const loadingNavLogoStyle = {
    top: `5px`,
    width: `100%`,
    height: `31px`,
    position: `relative`,
    backgroundSize: `contain`,
    backgroundRepeat: `no-repeat`,
    backgroundPositionX: `calc(100% - 10px)`,
    backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnAAAACrCAYAAADmdaFmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAT7JJREFUeNrsnQt4VOW19/dMEjKZkBvJJENCwmASMNVqRND6SSC0pRKoR0QEa5+WW2tbRAkKVAFRED1UbYEW1PYcBDmP9SuC0gvFy2kNFz89ipCibQ6QNEMCIfcrSQaSzHzrP+xNx5jLvHv2TOayfs+zn4QhM7P3e/2/613vWjqHwyEFKfnKzzNnzmTU1NSk9v6DcePGlZhMprP0azFdVvliGIZhGIbxa3RBIODi6colkfZ9g8HwDaPRmJyYmGgoKyvraW1tDaPXpYsXL/b75uzsbGn48OHS2LFjHdHR0bry8vLq7u7ug/T6bvrvIm4iDMMwDMOwgNOG3KqqqrsvXbr0wJgxY8ylpaWO48eP6yDWlEsNI0eOdAq6m266SZo8ebIUFxfXU1NTc9RisRRKV6x0DMMwDMMwLOAEsJw8efKR9PT0xcOGDYs6fPiwji6JhNuAFjZPgJibMWOGNHPmTEdtbW0NicXvSGyVYxiGYRiGBdygzKqsrNxKwi3j4MGDEkQbLl+CLVZY5BYvXix1dXVV0L3cJbFFjmEYhmEYFnBfIN5qtS6OiYnZSILJsGfPHunAgQNes7SJCLl58+ZJixYtwjbtzuzs7EXchBiGYRiGCXUBF19XV/ckCbelJSUl4RBuvra2uQO2VteuXQsfuVqTyTSOXmrmpsQwDMMwTMgJOKvV+qjZbN4E4bZjxw7pxIkTfl94EHFTp07tNhgMEyXeUmUYhmEYJoQEXH5TU9OBS5cuGTdu3BgQws0VbKn+4Ac/sBuNxptZxDEMwzAME+wCDn5uR0wm03U7duzQ/e53vwvYQsRJ1eXLl7OIYxiGYRjGJ+iH4ktLSkp+2NnZWU8/r589e3ZAizfw5z//WfrTn/6kr66u/ot0JbAwwzAMwzCM1/C1Bc5pdTMYDNcH4nbpYGzbtk1KSUk5lpqaOpGbFsMwDMMw3sKXFrh8m81WV1lZef38+fODTryBxx57TIqNjZ1Av87ipsUwDMMwjLfwiQXuzJkzr6Smpi7YsmWLDtuNWoOwHuPHj5fMZrPz97S0NHtycvKXxGltba39/PnzeiXdFkTkhQsXNL0XBPxdsWKFLTExcaTE4UUYhmEYhglAAefcMu3u7nZumarNUdobJTMCLhJuDpvNdonE2WdJSUkfmEym38vCqa/DBLm4JyXxPbI7lJaWSvDB01JYYiuV7pED/TIMwzAME3ACLhdO/SSWRkC8aZFFAac9Idry8vKk06dPnxk7duyz0pXcpFa1ApOuWeXl5f9Ows/8yiuvSFocqLjpppuk559/vicqKipJYiscwzAMwzABIuByOzo6PsXJzK1bt3r0QUr6Kog3EkQX29vbf5GamrrZC8Iov6qqaj/dd5wW1kJY4RISElZYLJafczNjGIZhGMbfBdwsEkH7Nm/erPdkW1IRbnQ5GhsbK9PT0+dLV6xtXkUrfz0IzsWLFzeazeZEbmYMwzAMw/itgEM6LIvF8sIzzzzjkU+ZkjC+ra2tbOTIkT/whXDzhgh99913HdHR0ddI6rd4GYZhGIZhvkS4luLNZDI9v2DBAtXbj0qS+MTExI7hw4fPpKtoiMplP7IqLF++/NOLFy/qDx8+/KU/gIUQ9xsTE+P8CXCiFReeHz5/9D7djTfeuDA1NfVJbmoMwzAMw2iFJhY4Rbw9+OCDOrXibdmyZdLMmTMdHR0dW+mzlvtD4SjPNX/+fB2EGYSacpACIUtKS0vro6OjW8rKykrx96NGjUrr7u42Z2VlJVVXVztFXGRkZEV6evpobmoMwzAMw/iTgFtA1061ljfF6iYLnSmSn203lpSU/DkiIqIAv6elpfXU1dW9mZGR8aI0+LZufkVFxZKRI0feSe+P4qbGMAzDMIy/CDjnaVO1vmKwZhUWFjqqqqp2+XHMtHi6v/cuX778f/lEKcMwDMMwgS7gPBJvsLrl5+cjVto3Jd8fUmAYhmEYhglY1B5iiEeQ3sOHDwuLNzj/b9q0SRo5cmQjibebJT6hyTAMw/wLC12zjh8/fjfNE2nNzc2N4eHhn2dnZ/9S6jvDDsOEJKoscFar9TMkpUfydlHxtn37dsloNB5LTU2dJnGWAoZhQo/choaG1y5fvhypxYeRyNlIP3YFQbnEl5SUvJuTkzPxyJEjTp9qEnHS2LFjnYfGpkyZ4jAYDO1xcXF3SrxrwzDiFri6urrNSm5TNeKNVlKHSLzlB9lq0SKvDFmQMgwzqFBpbm4et3nz5jBPP2jmzJkQcJZgELWdnZ3H6uvrw+bMmeMMx6Rw4sQJ58+tW7fq5s2bN3zx4sV/pXloJfskMyzgxMg3Go3LVq5cKZTb1FW8UacLdPGWW1FRsZqe5VskROPa29sdZWVlPTfccIOzLMvLy6sjIyN/46V0XwzDBAEYNxRh4gnjx48PikWwu/7UyFV9/PhxHc0nz1utVolFHMMCzs1Vo81mew8ppkTChQSReMutrKz8/YgRI9I/+ugjHYL7ygOwTilHPOvkyZPNM2bMWJeQkLCmqanpGQ7iyzAM0z80rh768MMP3fanxvyDmKO7du16gf65T2I/aiZE0bv7hwil8cknn4SLHFoIFvGGbWP6ceK9997LmD17tm7r1q1SX6tnWCVRPkuXLpVWrlwZptfr19EqsYibGcMwTJ/kR0REZOzYsUPoTRBxe/bsQZzOPVyEDAu4gZkVGxs7QdTvrbCwUIqLi6sNZPEGAdbS0lKIQMUYZNzdOobAmz9/vtTd3T2FRRzDMMyXIQH2HISYiEuOAt6HAw9cigwLuP7B1ukbSFAv0smQkP5rX/tah8lkGhfI4g0C7MEHH1SVZQLlhffiM+j9r3BzYxiG+RfJyclfxUlTNeCgQ1lZmZ1+zeeSZFjA9UFFRcVvsHXaV0L3/rjpppukxYsXOxISEm6XAtSRH4JLEW9qVoeuIg6Wy+zs7IXSldOqDMMwDJGYmGhQmz8btLa26rkUGRZwfZObkZFxL3y+3EUJ1Itj3lLgBl3MT01NXQDh5Yl4cxGD0sGDB2HR28VNjmEYhmEYTxnwFOqFCxf2Qni4xuQZDKTIqq+v/zyQj3eXl5e//v777+s8WRn2Bv5zu3fvzuMmxzAMwg598MEH2ALsQUiRnp6ecASvPXDggCaLxkChoaHBlp2drdoKFxsba+fWxIQqA1ng8mNiYjIRd8ddJk+eLE2YMKGHxFsgC5X8qKgos+ipqMGACK6qqkLIkXxudgwT0hRJV8IP6TIzM79JYm5aWFjYr+bMmdOCBXAoUVtb+5naWHYjR46UqPz0EmdlYEKUfi1wshXK7dUgtk6XLVsm1dTU/JQEXMAGsD19+vRv3n77ba98NgJQxsXF3WUymXjAYRhGEXOwyOHnutTU1KZQevicnJxVCQkJ74sYChRmzJiBU6yf0GeEehvKLS0tfQ9W3L7+s7m5+cVbb711DXe10BFw+SQyhKxQOHXa1dVVEeiRsceOHZu9evVqr3w2xPCpU6dyqGy55TEM86W5NhQFLOYNWvxniPhaZ2dnS4sWLcKvc0O90SAz0JkzZ5Kw/d4bpFqLiYm5mbtWCAk4xfrmLrC+kYBzREdHzw/w8sinlYzjwoULOm4aDMMw3ic9PX1KYmJiGYkQt7IxQLxt377dYbVakQ/VGuLFF28ymWbDgtmXHyG2p0nAcSMLUvrygbMkJyeniJi0YX2jVcAxKfB9EXKpE7B4YxiG8R1Wo9F48yOPPNKDCAbwbRtoroF4a2lpeZrzoDpjlS7+3//93zAtD9wxgUN4Hw1i18cff6wT8X2TrW8Bb8o+ceLE7SInbtWQkpJSxc2OYRjmCxRHRUUlEe/u3bt3Ik7kQpQgyO/YsWMls9nsPCRHf3OR5po76SriIpNgXdv461//mguCBZyT+OTk5DykKHEX7LE3NjZWUoeyBnphtLe3e9XWjADH2dnZf+BmxzAM8yWac3JybqGflry8vFk0p9xdUFCQdunSpc6urq5PSMT9Ugrc2KKaY7VaHzUQIkH2meAWcLOqqqr0IlaouXPnYnW0LBgKgwaMNm8LOB6AGIZhBtYmdG0ZP378Fi6KfomneXfTihUruCRCmC/4wJ0+fXq1O06kCnAmjYiIsNGv+4OhMEhgfTCQ/4Un4Mh7dXV1ozw4MQzDMIwqkOKypKQk/MSJE1wYLOCuKHqE0BAxx0KUtLe3/zGIyqOYVn0Obwk4m832LDc5hmEYxgPyExMT5zzzzDNcEiGO6xYqQmgIpc2CU6nZbA4mUVKE1CzZ2dmanupBOWVkZNio0/2cm9zAA9MA/4cYWcG2/WyRL39+zr7u8QuLHin44pf11w6LguT5crFgD+LnG4qy81X55XZ0dPxly5YtOm8fuAuQ8TKk2+1VAWe1WgtFrG/YaoyLi+sJtkm1paXl3Xnz5hUgkb0WKBkqamtrHyYBx8OfPAhVVVXdffny5dlhYWGW9PT04XgReSEvXryos9vtVy3DOp3Oodfre2ihoE9OTna+XllZeTE8PLymurr6xE033fSa3AatgTAA0XMvvHTp0gNjxowxIwcm4g4qz0vPaUe/wnMiRyTSDOXk5LwoXXFR8LZIwqSUX1JS8oDBYLiJ7iOJfobjHlEvDodD71ovVG/d+ImcnviJ+6WJpZbq7+90z3vkOgmEscFCY9891BZ/RP0znS4Dlbsdk6PyvGiDMTEx9szMzDA8J12Vw4YN+7XFYtkRIOJ1FuqVxuv/k5qaGte73bk+n81m666oqCincet1+tudUmi7fOTW1dXNb2pqmunaNmjcsbtmPUC/pfJyoPyU8YkoofI+SGX4voYCIx/ibfPmzXoRV6cAJh5hUtA3aY64JioqKuzkyZPdStn31S9Drd1ebYRUELfiyLa7wCGfGuo/ccQ7mCChsKSgoKC8v8CIoiCuEQ2Ux2hS+49QF23UGbekpKRMam1t1f/tb3/ToXxPnz4tufhxhPXxPp3U67ANtb3h1F6HZ2dnZ9I/51AbdJCg6KGB9X/l2FBFIh2YOv7faZCI9PQBSZi91E9sKgtNoHuoDUyk53aGRsBiCWJVfr6rc4HLMxrouSbW19fvzMvL20nldIb+/YDGq814EpTLaQJaSu1+BOoBF+oFAkZu/18q/95jB0BCchJ9GfQzg+65AHUCazbGCHlQfctdQYfTdZGRkT/x9OFIZF2iSfe6/iZDpM2D2wjdo/O5US/yM+v7aINhynPSlT158uQXqK5fkFM5zfXDCSOexMeTVLc/7urqMnz22WfONif3td7t7urzUR2GU9vD8yGt1zqqi8/pOb+noRhfQG1Ls4SvdL9zNF4oWKgNrEtKSppHY0IU0h8q7cKlbfRuH3rXBTs1j+Hou/RzIo1LTyj9gF57VuVibBaV2Qv0Odds3LhRJ3rq9Lrrrsuj95eqKFtYMXb1fp3G7xNaRGwgQXYoPj5+cV9tl8by39KYVIC+qbRb2eIYPki/dLbb8vLyalokP97X/dMCZU9ERMR4LRrLAGO+19s/Dl3qaGWtrL6bbr/9drffDKsSdfSdVGaLgk1p0MC3uaWlpfDBBx90OxdsXyAxNZVRIzXETCk00+Q4Gyx1xp+T4Eo4cOCADitHbwSdxIEaRB3HwoIEj/PACAnnbdSZN7tR9o6lS5d69P1yypp3Jk2aNN31dXrWV+jeFr7yyisSFgVq2pMca9HpR0ltaTm95OnpPFiddtHAMwXxtjBAyoJS0zqBNRH1gXqhgdVBE2JnW1vbgYyMjGcHmnSPHj36Nv3dHX2lBhJh27ZtUi+h4nx2GkD/m+oqE+GS1NaJ8nyoE6R0onrWaix0iIzDixcvxvevp1+fUl4jUflDmrxehJM70iGqdXRX2h3ifNKk9zYJ1fs1GMeeOnjw4JOe1i0oLCyUsrKypmq0qInHwQBqm/fS/Um4P60OCKCdwI0GbYXuV8nfumqA+8aC70VYwqm/m2guCsO4qaat4rsRQ08UtCvqu/2NNR6PlzD83HvvvWV0f1mur9OCcn1CQsKaoqKiMLRdNdvEaLcobzwDvX8vPce9rv9/6tSppnfeeScexgNvjPm+av8Y3xQ1myvaWDFhBmtMM5PJtJWuQqQgUTvhyhHFQ1m85ZOI2kc/R6Ajetvkr6yQMcjJHXiEshqTB8wHBhINng7WfaSsgQXklE6nS16wYIFHohVtUMlLTJN1vBaTFJWJhBAE3vSjwWfjkuteR+OFkSaxeyMjI+cMGzaskwbq70r9nGDH+7Q+YYfJIS4u7gkSrTqUp6eCFfeotO01a9YspPZ+1xD3d2w57UdqqvXr10uexgdT2h09n46er4Cer0yL59Oqbknka1JoELy0mHnp7NmzYY888ojmfQKfh3EJlyz6J1Lbfx9BiZuamp7qw4Jjof93uvFQmXt0P0ofVInXxsv+2i6J1ikrV6706PPRbtEnUdYkFPu0FPba+dFqzPdp+wd62eJ0l+gEExsb2xOswqSysvIQVudqGj6E7b59+5Bx4ViIird4GhD/3N7e/lcqwxH33HOP5Gt/DaUDP/bYY9KcOXOk+vr6ifTyLF+WASa7Y8eOJc+fP1/ykzQ3uQ0NDRfouhdlgsnB107QKAckLJ89e7buo48+MkpXHMJ9Ak0ORXq9ft1Pf/pTHe5BS2sjyhEWCRqUR6Depf6d3L3e5rq7u6egz2kZ3NVPns9r7YIWNL/esGFDGMYLb/cJRfSjjrZt2zY8KSnpBenLh2bye20b+py0tDT7ULRdjJccGkVQwNEEdzuUvgiyw2ZRsBUIVukREREZisVDFJhuSQDCeXViCIq3XHREm81WQB1RJ5JP15sDpo8FlHMwwmSn1UEYDSapR7Fofu211wyYiP3h9Jov76G1tdXqi8kB9T1EIudqm8Mzar0V3vv5YFkOFvGGdoEFxVBkM+jPneT48eNTvVWH7iIfGPPJ/I725O22G9QCzmAwpHu6HxwsAgRbbliJqW1I8PnJycn5TSiWXUdHx6c0EI7wF5EwRMLkmL+JN5PJ9Dy2cf1BUA/FJF1bWzvaU39WEZFDk/KIkpKSd331jCRCfkjP5pM2h+9oaWlJhp9wMIg3X7ULEai/WobSag8XFF+B3Rq0py1bOOmGagEXGxsbz8pXim9oaPjwl7/8pUcWG5y+k0IvXZZTvOF4O7anQpUbb7zxazqdLtNfBiNFvNEkpfOTbVyfA58aX0/SEDkJCQkT4Vvli++rr6834hl9+XzR0dEPSwG6lYpdlqFoFwKM0Mq/Tw1wAzp16pTXd4+SkpLSMjIypntiMAl1nIcYEN8mVAd4BZhxjx07ZvDESoGGj3AWUmjFTroq3jz1dZOP4F/9Nzp1ILXLmJiYuMcff9xfBqNZWok31InrqjyQfFQgNnxdH/g+LGRWrFiB5OteDx/k6wkQ7enQoUP6rKysXwRgFAJLfHz82lWrVgmXGdxj5MN7X+gPKA98lhJuxNO6QFzMoexjcMyPjY1t8Pb3REREGF566aWQ3a3RTMCpAQENk5OT4YQc8NYm2Zye7OkWBDo2gmAGW2y8AUAcsaK3335blXhTjnvjQgozWtXrXFd+tEIzYHGB34uLix3U0Z0xmbzh3Iutb08HXyWOmj9MUp2dnXsRM0qNeENZ4Ig86iQlJUWHIJn19fXIeSwZjcZwJfByTU2N4/Tp0zpvhCFRQpB4Up4i9aGEW/D01J8CymPu3LmGtra2RwXjRAkxWGgJJYyLazgJpZ3jHtWKe3wvTb7fp18DSsBR/b5IbUIv0q4Q/gMhKSIjIzvo/YfkQNVWlzLOh9/a9OnTb0SgZITmgYBX2Y4sCLQsfTn8jc/APFZWVlY6UF5wtCtP+wreH4puHX4h4M6fP4/I+AF/GsnVF0KLhp+QkHAgVBpPSUnJb202W5yaAx+IL4X4WXV1dUrAxSJUx7hx4/oUirlEWlraXZmZmTPXrFmTLZ+K0+Q5EPTxoYceMtB3x7sOLpjgRMJNDFYOygpeaStKwFytxQ9OUX/44Ydhoo7ZuCfEd6QJqpsWaG+ReHPGa0MGkb6yiND/5/f09Eyln99BnXgaLsVlZf7pNddcc+v69euvCniAVH8Y8N1dLAyUKxLPiokZIjUrK0uHDARnz569qLQBtC1MxIjXpLZu0B7oGbAq9JqA6+veXOO3tbS0tNL1/6hOP5b7mFNwUN+d8W//9m830tg3TD6cIGyFQ3yyqKiofEnQ2R39HhdAlo/W1tYwfL8nMfncXXDGxsbeITJeIZbnLbfcgjSIBXhOGt/7+rMiakdPKQJs9OjRz7366qtzVFq/LVjIfvDBB/3+gcjYJ8cJVFNWH/X3HzRmldF4mUjPORzZWpR2iP4C9xGtxktl8aH8jmdWFh6eCEcSyCe3bds22fU1xP4TuXdPJMf999/fTXUSrnZcc0Wv9i7kuFvfD3TxpqUvBCYDk8n0+xDRb/nwXxBNqIzJBQEIv/e973XQ71NJvGGZt0saeNsZVrkiKtvlYwkMIFo+CO6BJu4E6V8R6hNoQl8xadKkFkyE7lpc+htUMYi+++67Dhr0Wm677baDCLyal5e3/M4779xy7733nnnzzTcdA612Bdv0o2pOUUPMbN++3UF1spP6hInqFtkFBrOuF6Wmpj6p1IlWzs+33nrrGtQHTZpRLnUypqOj41eFhYVul1VfgzzeixiNL774ov1rX/vaGyTevo7Pp2eOcGkDCTRh3E31U42QQBDeai2AyIIgDZzjV1Nwr2hPX//61z8nIXAN1U88ibcZ0pVAv0Xy9RS9dktSUlKk3W7f8Nxzz9lR/2qsjBUVFUsE3/aUS53qaEH2TVoAbJg+fbrbfc0DZlVVVendnfzlYLaN1A5HCohUK/oOfc8uvF8FRa7l0/tS45t29OjRdwb6zH6up/r7PATfRV9Bn1H+nvr+3ddee201BK+71rf+BAvaIvrd008/3UHr9sMYL6keFmK8pHZyZu/evU5B58E8PaXXs46h/nAI44IP2OVabmrGNc0EHN3INwJZvNEANkVL/xGs5KUQOcBQXl7+OokEoYTKmOBJJDhj5NFKNk3y3zA0zdj2oslvFkS5u/2hr+ellTgGpEaaTL/eazLdogjSurq6w2om0L6IiYnZKBrnDJP+8uXL7XSPs2WfJn8Mf2O94YYbHqay+rvawRvvo/pwUL8/aDQaE2WRWtTPgmE/hH1lZeUDTzzxhF1t/WCSorHmKV8UEO4R90qi6kfUfr8queGLCwFOZXHzmjVrJNEJBAK1p6cnz8Pbdi4CRPqaWkpKSpa4a+WQrZgOs9n8DTX9gfrRBm8/j5+B/pKDLDhqF1dKAPwlS5Z0ULlPpTkiWhZb6D+7lPGSxPEGjcW+lfrLLIwPvjyB6zquUZ89pmahqFrAYfWVnp6eIQXgSSRl2xTBFLVykkflU8NqkUIj9lt+VFSUWdR/AalvSCSUBVCMvGJaAaryRVHEanh4+CEajBIHEqs0eGzxZEXpan2jgcAgsnWKSZtWzY7a2lqk9tnv7xVy7ty582pWqihfWH5JAK6URbRb7Q85jCFwIHDV1BHqgtrCbd4uF9wbRBjuVUXe5eLq6uqDohYjjJ1UF0laPYNer+/xZhlRPeS4Gy4LW+zYfvZgQW7FVqgUWng0pmO8/MpXvvKPwRb3NH+8HxcX1631vdNi7aLrITpf0tDQ0KhGPOrlN9tEbxwrfKzAaNJYHEANLB5Jfb0R/wcHF6jDh0QwPVjfkKlCBKwupk6d2k0D/oRQGJCwkoR4I3GW7+2BTwHWN9F6waSPPJfedLQfaiD4fvaznzlorFqh8jmLIXDd3R7qLXJ6enqwZeK1rBMY+HFvsEyoFRy0yFiCfLUi74EVRfGBCgRET3fqdLp6ifEJ8L2ldozt6tuHanHf0dHRHWjl5hRwra2tzWrUH8zRpIQ3BMiz5tIAZy0uLs70RvwfOYDviyHQ1yzJyckposl40UFpsL9XCgELJbayMjIybDDL+/BrZ8HfSsT6hjY7btw4u5ykPGiBZclTkYr3dnZ2VqvZSj1+/LiOxp67vfV8ODGMe8NWpAcfY4XFSdTKiEMIkg99/HyJzWaLZmnlfWA8+va3v22nRcTNUmjmDfdMwDU1NZ1WTnuICrhLly4Z5VQ9fgvuD7HK3n777ThvxYUKlQC+NBEtJJGgEylDTHqYYKQA2KLTAvhntLW1rfXlYFRSUrJa1PqG+zx//vyrwTxowvpWUFAgaSFSx4wZ8x01junyic0Cbz3j3LlzcW8/8fRzcFpVdB6QQ14EHRjfSFCYtF7kKxf6HtqSVoeXAn28lMchK0syMZzmb+q0b9XU1Kg6agVB9Pzzz/+Mft3hhxMB4pS9l5SUNAGBG70VowudEPGyQkHA6fX6paLhKdBB5VAhQQ/aQlpaWk9UVJTHW5K9AxsP5OZgsVjGi/q+yQ7HjwRzfWCyPH369BlaYGkxNhUhFhjVg1HEdxZ+V3fccYdXnGvQJuLi4nq0WByRyH23vr5eSGj29PSEB2O78SRMiiuu4UDgY3Xp0iVbdHR0S3NzcyP8nkgkfhTqwgULLGKDVv3dnfEyqAScdCWOjarggRBFx44dC0tPTz8in3zyF2bZbLY3ysrKwr0djR0NBbHESKQEe3uJpwFnBILpigoa6UqokKAHvn60GCqhviDchl566aVuKl+9nEi6z0G/n8kkH3EZRU4E4z41FDZ+Lah1Ot1RrT4PgVyp7ApEBBz+1jXGoNbPR6LrPI2/Wnxc8RCcwvNbcJr7ySeffM9gMGSrFFlTXfurax2x5e1fgguH/1JTU4XKNzMzMwyhgKi9OvC763gJXzZkksB42d7evjMUBFwxPbCdGlWYmgB5EEjbt2+/Hqc73XTa9iYWuo8/JiUlXY8YZaLWIrUCjhrL0RDob7mlpaUOEsNuC30IBepU/wyV7BSYAEls/beKiXPqDTfcgN8hqIpFBn3EY6SFlNDiCwMn1cmzoVAn1D8rtPqsnJyc39DCUMhK5bJ4jJc03qXA2HP27NkSjQQcUgF2Sx4EeA8mMHe8//774fn5+aVRUVFzJHErZxGX4sAoh/9IwAmNlwjLdOONN36pnENNJF9d6ZPoOa42YCUGKMRTM5lMkyHihuhZ4mkie4V+ln/88cfXI0SIWvEmWvGyX8Nrwd5Y6urq7oJDtgqhEAqHO64+L/WDQ4Jva5b+FWRVeBs+PDy8QNQ9QN4+5QlGnCI14UT+9re/2SUvnkRlBkdNtAUYJzZs2BBWXV39Vnl5OawbC7gktV3w0oLorAfjZUiPYXqXleWzcIZVCyx3SB2CEB1VVVWfSL6LD+cUbh0dHQ3UyRbOmTNHEg1k6oqS90500pZCwP+tvr7+dkTQFoFWVnYpRIIb9xpgfMaYMWPMIlt6aK+YzCR2GlZVt0i7JbrIs9vtei66IRdwlWr8omAIgEHgt7/9rbm0tHRnZ2dnt2yomMWlqsmi9+9cCh4KOGJ/fHx8tycBRTGJIERHWVnZBOosF7zcwHNLSkqQ36+JOtXCJUuW6GEF9CRHGmIpIS6WiI8XBoRQmQwjIiLGuBsIUyEzM1MvsaXHmziTX4u0e4iPtra2Ui461YvVeiUxvLvIC0oLl97QMXz48NfV7jIBRF2YP3++9JOf/CTs448/nkLzzpv0soPGxNNVVVXruX6ZoRRw8FX6L5X5274wUEFIvfDCCwYvmJ1zT548+cumpiaas9qPf/bZZxNhcYOZ25OMCkoKD+S9w+pa5LNkAVcZCo0lISFhuIhlkx2ifSPgaP4Q2taGgOvq6vqEi04dCPAqaoGTxxSe4IeQ1NTUnXAd8HRcQl1il4fEnA7zzxtvvJFdVla2juakf2JuKikpQb4u3i5nvE54LzHySEdHx3wSMnpPQ27A7IxrxowZZhKFO+Pi4v6zpqbmKNIGSVe21KxufEw+Bj3ksEtOTv6qwWCIPH/+vO7111/X7HACBBgsb0aj8Ritqn9IL50QEXCIm0TC5kAoNJbExESDqLhF8uVx48ZxT/MeuaLuArCyU938gYtOHXI6r+u5JAIOK80ln9B8NBECTAtg+cYl51jVUd8y4pQyzQkFCDnT2dn5AgnHzRIHqGW8LeDQyGgV8Utq4IVLly7V5AvQsHHRhBFGDXsKNfApyjYtJncSTq3h4eFdyt+3trYmjh49ejhStJDgg3laBzGJbU2t8pYqwN+tsLDQUVVVtYs6GZJ4zxIVrvRcDpPJ9HtuSsxQQH3iBtF+odPpHDyhqCclJaVK1JWA8Q9ycnLm0lWOOUnr+QRg/sAFgUjznXHu3Lnr4uPj1yJQLQwk3O8Ybwo4nKBbToLqgXnz5hlFk5UPMtF8ocPIQUpx0OFLhx1gUZD/1ivJgPHdSKyen5+PgKvfpPsokjvfd0UFXFZWFu6xiJsSMxTQIidV9D0xMTF2Ljn1ICzJkSNH1Ezu13niY8xoghU5Y7dt27YORgpviDgFZRcKO1qLFy9e2NnZ+f2mpqZnPEx5xjBX6fNkVEJCwkxqcA5vRjKGSFNWK70vb3YqDKCvvvqqlJubW0biLclVfNFKaZLoaT4EIeRmxAwViYmJI0S3UOXAl7zo8DGjRo06x6Uw9EBA1dfXHyIR55No/ZjTIBZXrlwZptfr1/k4SgMTagIOg3tHR8dW+IYFiyM6ngMJ1Z977jk7sWHkyJFZUi9ztmg4Bvi/IQghNyNmqKBFxwjezgsMTCYTL/b8BAScb21t3bBr1y5n2ChfzHMQcjjFWlNTM6G6urqMRRzjLQGnbKUe2r59e8CLOBwdh9UtLy+vzGg0ZvZjws6Fz51IOAas3nJycl7kZtQ/VN4c1Z0JKurq6uK4FAIfeR4YM23atIp9+/Y5faK9DazlsMbRPDMCebq5FhivCDh5lTIrLi6uNlBFHLY4YSZfsWKFzWw23y1b3az9/HmuaDiGcePGhWKQWqEVZ3p6OscSYYKKU6dO5Yi+Rw47wg7s/oeVxqjRSGV3//33V0PI+cIih1Bber1+ghw/jmG0F3AYcEwm07iEhIR/BJKIw2CJ7V9sl9I970xMTMToOWAeO4QqEdk+xXfIScdZwDFMCDFq1Kg00YDhcuBfHiv8l6IxY8aMpHqaOmnSpDPvvPOOMzYorHLemPdgiUP8UpxQlXgrlfGSgHOKOBJA12E79c0333T48ykqRbjt3btXuu66694wGo2J2dnZi9xZ+cbFxY0VzcBQXl5eHUqNpbKy8qJo/ZeVlfVIV+L5MV4iJiZG6O+RuUHioLKqcTgcSaICTq/X88nfABFyY5FhXZISMjMzN8AqBzEHFxxY5rSc/7BDcerUKf2ZM2d+wcXOeEvAOYHTZ11d3crnn3++B4cB/MkaBx83bJXu3r3bnpWVtZNeGpORkTFXEtiySE1NjRMJIQIB193dfTDE2kujqFioqqoK01os2Gy2aO66VwVyqehJOllUs4BTv1BMEs0JLIcbsnLpBQzN8JGDVQ5ijurv7ttuu+3g6tWrWz744APnfDNv3jxJNCNHb3bs2CElJSXN4+IOTIxGY1RACDhZxP08Kioq65Zbbvkc1jhfnd7pZxB1rojgs7Bq1aqOlJSUDS4WN9GBMr+0tNQh8oZQjGZfX1//sahYgCjG9rSW9xEeHs5+dTLR0dFtou/p6enhgyXqsVD5hYla4KieWMAFsJija39OTs4MEnXY7hxD4//CadOmffJf//VfPbDOqT0AgfHx8uXLEAGceivAwI4d6ZA0LT5r9OjROWrCp6kZyK0k5L4K0TN16tTXaRWS8rvf/U6HyNaeJJJ3V7TB2obOQh3Jfvbs2U/NZvMq+q+ihIQE1Z9bV1d3V1tbG9KgOLej3BEpsik9pHxa6JmRMmyOaCP/7ne/+1Ut7wMHIzxN9RZEdfJ36vhCdYKBgt6XL3EsODXkix52wlgB9wNqt1x6wQGE+C4SdLvwj6ysrMJHH330eZqXwnE4QTQuI42RuoKCgnyJfSQDDmSO8tQKC5KSktJ8JeAUimTzcv5tt9323H333XdzVVWVHkJOq7RXKBgMfoi3RpcjNjbWbrVaj1OHeVFeEWlyqqu5uTnOaDQ2r1mzpgH/xraU8n+TJk36aJCOHErAPwSWSrcnMLSDrq4ug3TFD04LwTBLtpbqePi4Uie04BCK7I4JpqSkZAb1n6e4+MSANVk0CwNcqqjMS7j0/BZY1RQLWLMKIbXFYDAUZWZm7t++ffvoBx98UEjEwfBx9OjR6TTXbOGqCBwwt40bN06LAygLzp8/r1djANNiK6WIJoJb0AlIWM2aNm3aElhckHgeK1U8JBqz6wEB/Bs362rpUixfcootDHqOsLCwnoqKinIkizeZTK+iY9F3aV4R8rbrIlfhyPQtWC9fvtyJhM0iFjCIeoh8uZ14RGVl5Vb6PBZvLuuPtLQ0OMi77Q6Bvjh9+vSxXHTiWCyW8UiPJDi+4JDUQS69IRy4rNZHMVFGRkZGwWqSlJRkSExMNCj/f/LkyW7ErOzp6WmmSVnNdk5xbGyspbGx8bPCwsLrccJURAgUFBRkcS0NLcOGDbOJLoQROzYlJSVX8sB62tTUtB27mGreq6UvDFYuV83KGOtoos8dNWrUlPr6+tupgY5Ax8F/KJ0HyezxbxJq3dHR0S2wfMkWL1hqrLiuHAhi/IXq6upDkydPLhARcMipO2/evAmS51a4WSTmMw4cOMAV4TJxIJwNFj7urvpRdzi0I1seNLFid3d3R4RAWWOlLOz/ht0DGuTf4qY6dJBw+8nBgwczFUOCS77tq3MhdnseeughTwX+nXSVb9myxe3+2NbWxhXkB+h0unrSG2aRuQ3b39ddd91q+dCkMNQGX6HvNcLIMdQC7kuLHlwmk2k/Xc4Xelu2aKXzhX+z5cv/IYG+mkRUwdatW4VWKjt27NB973vfO0DvTVMpGnI7Ojr2PfPMM8I+JsFOaWlpPYmEJBHLELYB09PTF+Ngkhb3YDQak4O9XsrLy/8dixERYH2D64fE/k1DDsSbD3xnrciPTfUe5w9+ulhsfP3rX0/j2h+crq6uT2ghfL3Ie2BMuOWWW+5UsxiGVZgW0guw5a4WPVdbQAPT7Sy6npKvfMn7p5mKaTXbgcMkImDi++ijj4wqcwDmk3j7dPPmzXrR7atQGXhE41OhHB0OxwqNbiG/u7s7Ugu/Vz9mVlRUlFl0pYwDVzU1NUe5lYYOsOSI/L1oaCZRAYe4hVwrbi22/iA6jkKkV1RUGEiM7Rd5HyxvJpPpeRJvOk/GTRZwASjaqLEUdXZ2dtPEcJwa0FuvvPLKk3v27HmSfn+/trb20/r6+ktoIJKXIny3tLSsmztX3GIMvxC6xxENDQ3Yg1rgxlsseNb29va/QrypNTMHOzk5Ob/BNp3Ie1CWECSSBkGWaZL4T1qJBrNfYjy12dcRs0sULHQsFgs7p4cQNF4J5cqFldb14JyWIF6h2Ww2ca24Z5yQD+kJgV0hg8Ewheaqz6SB42vGw+pGY0knifyFnoo3wPGgAgeImT+Sar/u448/1pFg6y9si54GhGHz5s1bmJaWNr+5uXmjnLRZuxuxWHbQoLCJVivhotsEEHE0qRmWLVu2MzIycjt86kiA7JH+daI3nhr1v9Gq9C76jhElJSXIZev1EDUBzn4cZBg5cqSQfxYEycKFC/dT+8Cgo8oXDrkc9Xp9pujWYiCBpOM0wRpEFxBYzUdERMAxej830ZABh/mSRNMyTpo06W1v3AzGA1pwh9FiDQu1Iq6eAXEe0qP5ySiy04Mynj9/PuLSXk/z8z9tNtsl+pzziihH6r1hw4alw++4qalJeu211yStjBEs4P4Fth4Vi5XrsXIc8f5aX2/oFWKkuNckWCxpl7x6Vmdn514SM2E/+tGPBvUBw+ABoXTgwAH92rVr15Hwm4JMGhqWVXNjY+OzhYWF69BwRUHnwEVC04gDEfX19QWuAaEhCtEp8DdD7FeVL2ctCPP3xotturlz504R8U3EIDJjxow4Gmz2q2kfWE3SgPWEaNgEl3aaIRoYWhTcFw2oa2ih0KbC3y8e4q2jo2OCyKlCBQQat9vtLwfSIOhwOPSh+N3KuCmHhVB9uAdpsWD1EukPsvXcLXEVGxvbIAnurKCfFxQU/CcJRZGTrsp4EFKir62t7QDNSfeKuuqgvjH20oV4soaYmJhMGtsy8X+HDh1yzmdKRI6BgMUeh1rcNYyEkoCDlcGCoL2VlZXjaeLBv0cgKCz+s7a21o5CpgFXr4iIwTh9+vQdrqttoNPpHHq9vueGG264WrY4bWs0Glup8mrCw8M/p4o9LFucrNIgseTkSfL5LVu26ERVO54BAmv79u1TSPz9GZHEtSpMWPVoNbFi3rx5RrXWFzRof/abonv7Pg3GYQHRuC2WQmonx3FYRGTyQOBRtA8SKp9QnU5zd+LCFr3sgKtqGwB9TU4htEHyYjxFtE36rvBly5a90NDQsLG9vf2PGRkZz0qDHCpAv6NBeCMsbxBvogIV48G1117bExUVtV5k0hRN0aUl9N2rEMtzSEwfVuuvhuq7XSfhgwcPSrfeeuvfR4wYcZ2oiIM1Gn3i8ccfd/s9oodcqC2fJ8GXKRoFgIRBJtxRaJyYNchz5cMlgsReJs1vZ8YKhIHA89NiJ6BjdNLYsCoxMXHO8OHDdWqNB0rdiIpAGDHWrFnjHJPdJVgFHMRZPomWuRERERNh0kYC777i0rl0BK0GD51rucpx7ZyrOup4GfRzIg2UC2lycKDzIsUOTSy21tbWZpvNVukq8KhDTJUtHKr3yvGsaBCvvvrqdOnKgQfNtnMSEhJmLl68+K84Su1LIaacVnZ3u9CNdG+uFleI/Bup3O6j7zHDv0EUWiD8kQYyxJVqpfrswmuKOR2pr5A9QV7Zarm6LaZFSA0JarOIrxbaByxoa9eunUCTVh2t/rZRm9vaj6iyUJtcGBkZuYreZ8D71NY7FiPYqsjLyyvHqT04fl+6dKnz3Llz5ydNmrRJy7JRLL5YGc+cOfNeuv85KSkpOpzepfqpxnfi75DXEAs7GsBHdXd3619++WXVWx2FhYUo21+RgGsexMIRT+1tCi2GZqalpWWJWFAVxo0b9w1aJDYp7a25ubmRxpTGAcrxC+2d6nAyXBawoFXj56e0d9k65BQZVJ+1VN4r+2hHX+prPT0936fyHoHQG17+7kHBPVBfSJ04caLSF14dRFzheWbhhDJ8StEnRNwYkE+VyuBNEg7uWut20lw2WXQOwH1t2rRpCtXzBRon3offrIuQs2CuNJvNU6gPGiFi0e737t2bLc+lVnfb769+9Sth8UZt9af19fXLEIfNYDC0K/VI9drpxfGy37VERUXFMaqXiWr6glowR9FCWjg1qc7hcEhBgCLYliQnJzuDCCuiQskK4c8hDpQAxljsKIGMFYFHq3+dFicvcRruxz/+sY0mJ02T72LVRYPnuqVLl/rEmqY0dAy07q5CkXiaBoGp/Q0A9Dlv0OAzG9GwlfhQardwlbp0pXd6Nlhn6IJl5imNiycfBz5mz56tavWI+8KEQqJKUhYVGFBpYRFNdRyP2I0IP4LBXavTwBDjNHFc/R3tdKCyOXr06NuwfHs6uCrfi5+u4YsUq7AnPpcowzlz5rTIeTP7rSd8D42/OrRj1BfKVPR7XctPAeMI6rC/cqS6/TuJvHFUv2HeaO/InPPtb3/bTmPxN3r3uf76mhqhLPLd9B2ltBhz23KFvkBiX4nhp0MqNBKZFxWBgYMKtIAdjj6Bz8T9iz4D6o5EEn4dIyA2LfTd//zWt76lysqFMsM2HZ5Pr9fb0f6UNtg7zAoJWaQJ2ykHunflKRKBT6AOFSMI6hIhNUTbT1/tV6lH17qgZ36HFiTTfagnyhcsWOCzHSKU9YQJE2obGxuHkQiOd6edfvDBBwFtgculwn2YFPpsOAdiYlEaYaCFM1Dut1elaWqGxuCyePFiRB5fQNcurT4XW6nwsSORNMXbIk4RbzSoaPq5NDjE/OlPf9JrseLq7/ldBQ98o0SPq7tJEa2G/y4aCd5lcr3aBmnQNlB5m11X8YPVrSJSRdoAJm9FtOC7lfR53kb5Xq1jdaEMHn74YVcLRZ9gNwD9Ravn6F2P6Cv9lePly5cjN2/eHKbFs/dV1/hcmowgonze1wb6bpV9QSeLCCjF4b0tW56Md8uWLUNqtoM5OTkilkIrnOTRP9V8dy+3lQF3nSDI1q9f/x3JJUuRglZ12Ff77T0XYrz0cUB/7H5t2LRpk9PH25vGH/RT+h6Me40mk2kcCbhykfcHmoCznDx58hEEIB02bFhUaWmpTtkeYQYHJ1enT5++mjrDLk0rxWLJhyWOxNUTanz13J0Y0dBp8DpEHX4UvZTJNdpnXeSlpKTUU58I86RfiE4OykBUU1NjX7JkSUiGJ0IZwNqLwZ8WNhy4N4jQWujDSvuVr3wFOyL3i74XW6AzZswoULPdLvrMch5rTV1vAgHFMAH/YLWHtNyd0+x2+zGz2ey2/7ErgTLQzqIV62n6WX7+/PmHnnvuOSNMyLAysHhzH5QVid9rvNXgo6Ojv45tWkxiWmXVwKSIFdiuXbuQcm2Lxqdpg5HmqKioOWvXrnV4+4SnKxiI4uLi6nU6nT1UxRusw/X19Ye0DtvDBBdwE/jBD35gJ/F2m5pJG9lwZs6c6RD1l1IDFuMlJSWrQ3QxnB8eHn7ozTffdIgGrh9srID1FXMaiTcs9iZKKk89+7OAwxH+9Qh6V11d/dbbb7+dfccdd0gs2tTjcsrW4qWvKKJBaSQ10J27d++2Y1JX2/AhACHc9u3bJ02bNq2CXrrJZDIt51p0i/11dXUrSVD4RMTBfwNbACQcfxiKhY0yhnjDYM8LDGYgYHlbvny53Wg03iypT69WLLtK+ETAkWCEwIgPxfpCf66oqPjRk08+2S37Uns0TmCshCD86le/+gm9NMbTxZ4/bqEikOsvEIS2pqbGuc/uDznlggXENbvhhhsg4Kxe+opm2en1kczMzOUPPfTQMmq0sa6HSoDrwRJXh3I0cjgOZ2Vl6Wjlh9x0q+gq4poTHnh+brVaISye1+ogTF8rSQxIVGeNVH/Y0s4NtXLGAgXWTlpo7lWb0JoJfpS+gm1TEm+3SR7mxlVcJWgcDfNmEG0s+uFfjrE8VC3LJGD/g368MWrUqCeffvrpBy5fvhyF+QxzWX/x3ZTDiJjTcCADcxrCxSBeZ3R09AJBv8eAEHBXhVtpaake+/ss3AKaZrnD47Lk5eXlU8NdOG3aNEtHR0esHDDTic1m6z579uxFhAKgjnCYxNsf6OX91Mi5FD0UcdDs69at23vs2LEw9CmtMlpgJYoJyRP/DV9ZPDCYah0SAAMztkEmTJjQQ0L5J/Igz/gpDoejCe0V7cDXAcKxk0Dt0NHS0vJpYmKiVn0FrhITvvvd736I8Dha9m1XEaKcSq+qqgr5+UzeAcKVS3PUw7BMhoWFWZRYsr1B/NfIyMhzNO/9txKOhsZkTW/KLwQctkoTEhLWUKcKW7JkiRTkSbGHFJpsh2LbHKuNXbQK2dXXfxoMBsSycvvDENZC5Mupk3W7MyH74vSj8l0+ZD8N9Ek0yOzfu3fvFMR4wopdbR/DqhKD+pQpU+x9pWlDXENPylHrssEkRJPc5RkzZgzTYvLG/SEPMHyQEC+KyvZbNJALT8gILePN9jZYOXr7VB/awVD1tb6+W/YzWnD//ff/+5o1a8zejlqghMRBW6mrq6ume/oOXUUaf00xXFaSkpJ+S327AH0bbdxTIafcO0RnY2NjJb10V+9DOUE8XrpV7n2EVvkSInOamjKB4WOoBVx+U1PTgY6ODuOzzz7LFjcfkJycDAEX0CfkLl++bNBStEZERHx6zTXX3PrQQw/5WtT6bPUo+2ZZSGzseumllyYhhhO2AZS0ZQNNYhioMeFjUKeB3E7vfdVoND5CV2/h0qzX6+uoHA3+VDa0Cv53agPFNHm/VFhYmEIiTqfEvHJnspO39Z3PjxA2Vqv1kIfbIM09PT3NPmhvfd5fV1fX8TvuuCMRPsXegtqBrS9Lky/6Wn/fjUXkmDFjsIh07gikpKSsfuCBB8ZQXYQpQd6RCePKeTmxk6fKdhn6CrbLqJ84zp49+6kPXECa5Qw7zr69e/fuPGS0wEKld1y3gRY5ShuHSwDaONxXqI2v6kd0WqkOm305XtJi8dNQmJ9pTHVLk8HlCLtWQxXIN54GwSNIzI7UP8GcCNufQCd9+eWXuw0GQ0QgPwcOtjz66KNux0FCwEMpgNO7eGvxhFRh4eHhBTTxJFGbcA4c8JFE1hL8rqSDQxBTooQmCKSgGtJwAqKBfLF9tWjRIteAts5sEpcuXXqAJnMznlUJqAvLHC4lsGhsbGxPZmZmGIIa19bWfkbP/6L8/M3cfIIKC125yChQX19/O/WFdOoXw3tvjbn2DQBLH9qHPCbZOjo6am02219onN0tDV0OUbimIKj96ri4uLGIkYoXT5482W2328PQzmWRayfh5lDuH1lJSNh/ImdoKOI2PmQ4sLAabJcACwUS0M0+t8Ap26XuJmb3Fa7mYCUjgrsojvnAn7M+YIVVUVFR7uOgiJqD6OfuijdfHLUPUIpoouk9ycTTgO56EAGW2maayILpua0uvpmYhC25ubkWl4k8XvqihRonq9HmuMUEL1ZcJpNpP139/hH1jfy++pE8JvlLG4Hwgv+w60LLIh9ck/q7f62DozOqxbfb+sGZOs+XN3fhwoVjpPwzV65cOSTbpcpWkBKlXFlhK1YGWpXbaEBvUXIJ4vVx48aVUKducf0cWqnFnTp1KkcuxKiCgoI0+GVha09xzldW9m1tbVfzr6oxzWuJvAX0rJdWsK6ToOXo0aNfowFtBA0kD0jabtnm1tbWItaYW758sDrCmdSb/ghBRPMQWg6GdPLmqmfcWfRwGw8pcqV/hU+BhXY05n0imua2PG98X3FxMSy8g+4WQceQpqjxlYCb1dnZuZduLgw5LH1hoVL29PGTHtZOQk0PkdbT02OFqZhe/4PrhOVqZRjMaRKrtIFWar1W9haz2Ty5u7v7+jvvvDNdySmJv/nb3/5mR1w2RdApljxvCDwI1oSEBPiG7PL0s/7nf/7nmdTU1IddtxhgoqeyDXdNLwPBKGkfPyiXOpHbBzHQ0HESiMcihmEYpj+QL5fmyNGKOwkMBUrsVPhGKv6ykyZN8sr3w6UFvpju/C2MUOHh4Z97XcBVVFTsIcEyx1uxqFwfCA6YsiOmA3v8JNj+Sa+/TmLjfQg1H28FXV31kFjsSzRZbrzxRqfAGzVq1I10r+MRYoP+PSIiImL4Pffco+nNIOhjW1vbWi3M/CSAb/7888+H33fffa4vh/clGvtKVOwJJSUlS0Sdi3GMm4cnhmEYpj9GjhyZOWfOHNeDTX0aChYtWuSV74+JibnL3bkNcyuMUN4UcM4t08uXL2ciIazWMWpcRRsuxKopLy+vjoyM/A1N2G/Rfxf7ua/XVYHX26LX1NTUPmPGDKNWOUXhyB0XF1dL3/FzDVcrQ1JoFotlvMhCgBq5g5779zw8MQzDMP44rxG5JOAS3J3bSNtgq7XYWwIut7q6+i/FxcUjvLFlCsGG7TmIttOnT5+hh3GejhszZkxQnJxpaWlZR6LrBS0CTqKc7rvvPqRuuSPQy8VqtT7a3d0d5m4nw1Y4MjpIoefXxTAMwwQIJSUlv/nwww/d2j7FrhJ2GDEleiOoa25HR8enJD5GIG+pVuJNSWqO3JirVq3qyMzM3EAvJ4y9YmbbJQXRsWdE0Hc4HGWIHO6peFuzZg0OWmA/tjjQy4VWKBtFQs7AzAyBz8MDwzAM46fkZ2RkTHB3boObmNVqdTrMa22Bc4q3zZs367Xa/lOSmhcUFOCmPzebzYgeWJSQkBDUNUrPPUGn00HEOYWwKCgzWN7oV4i3IYndJYt3nOQp8vSzzpw58wqVh0GkXUHAytZZhmEYhvE3oJn+gjMC7hq75GgSiEkp6TW+Ec3EG4QbLFB79+6FReoTemkM/fyqFDrbYc1IED5hwoTaV1991e20Jfg7/P306dNbjEbjzdIQBl6FQ2ZlZeVyTz8HW6epqakLRIQs2s+4cePs0hAHnmUYhmGCh9LSUvifzdJSM7nr+4Z5DdlwlHlNKwGnmXhTtkpJhDgU4ZaTk3OLpH0cG2fEalREXV3dZkR4xzFiEhxnT5061YSL/s/R0NBwZChFnMlkSomLi9vy3HPP2bdt2+ZU39gD7y3akJ8Swm39+vU2Em4bqJJ7ByT1OQcOHJBGjBiRjvJVW0c4xUxl8PyDDz6oE8lZiDZUW1uLuuOI4kFEcnLyNUPoaMwwTIiD7FGkd/bJ+kHVvIYdpfb29uOimgnzWmtr6zvKvKbFFqpm4g2HE5YtW4YwFRXR0dF3kXDTUoDEl5SU/NZgMNyEFDp4oXccNgiOtra2q2+AKMrMzPzrUDcYEjCwYiGDxeJ77733RxkZGWOUWDVASXUkB+n1G4sTTMIQXps2bSokIfxjarB/pHt/URaWzQMI61yqq1WjR4++g96nf+SRR4ROB2GVgi13YgEPN8EDsrikpaVlqYiTaJEHW6vEAU0ZhvEAWMugdwoLC/96/vz5UtdQZYOMQblWq7WQFqF5paWl+scff1ztvLZEec3TXKiWzs7O0l/84hdhnog33Bic7WlytyUmJn7HSyIkv7q6+n1sw7kG5RuI3bt3IwDwNyQ+xfgFRPNRKuJczoThyM3NdZ62sdls3UjIq/yNksUCJmokWkebErG6KZBglEj8vUHtaS7XVmBCIu0NWqSMjo+PH0ErzkS0DfTbrVu3SiJhZGCxvvPOO7vxO7KuIH+l6/8jh+Xly5fP0xjEuYQYJrRx3H777W7/sWsYM2xrIlmAMqbU19cjaL6UlJRkUAL3Y+F55MgR5/ilZhcBO3D0WV+Y1zyxwGFAxWlTj8QbHn7t2rWOioqKt+nm7pe8tOWFKMcoQHdX76gcuUJYvGm0apEnXp2LcA83m83xLnWkHHxQnXgeE/bEiRO7afJ/gEs9cCGxP+eVV165mp3E3UVXbzA20dXvOJednW3YtWtXJpc4wzAiYK6Sxxf8U+86ppB+MLgsRj3+LuwGygauL8xrqgWc1Wo9UllZOQIrYjVAICE7QH5+fk9UVNScXsl3tZfWDsckEWsO/MyqqqpaSFlzS/USmJC19GdCnVGbcpB4myax71vAI2Lh9WBhxwXNMIzfjimY1x5++GH8elvveU3VIQY4pSO3p5rwFgBbptu3b5euv/76ChJvSZIP/LbgNyZSsIi10tLS8v+4OQYGaOTUphzUNldKbDVlGIZhgmRes1qtK6Q+DiWqEXD5RqNxmdogvbghnDANDw8/lJ6ePlryjaXE0tPTEyZqgcvJydnDTcj/gW8dGnlHR8dWBEHmEmEYhmECGbgD7dq1Cwazlf3Na6JbqPENDQ0HX3vtNZ0aMyEm2p/97GeOgW7IS+SePn1ayK9q/PjxDikIshcEOzhWPW/evKFoUwzDMAyjKdihRDQO+HLTP6fRvFbU398KCTiE4bDZbAaRdEauahInTa1Wq88nWrrvB0QcCVGAcq4xFnB9MGrUqPcmTZp0B8oJoVe0cNJU054g3pSQM3RxXTEMwzCquHDhQtm+ffsylYMJvo43ifkU85pskDhsMBgQLHjAHUoRAYd8XdPnz58vfGOwvMnibcVQWEkQ+010+7S+vv58eno6t+o+kOtwX1ZW1rqnn3563uXLl6MQ9gOnTHFqUKv8t33VCxr4zJkzHW1tbU1ms/lR6UoeXIZhGIbxREAhlFD+bbfd9tyiRYsmlpaWSsqc5i0jBQ5zwt8e81peXh6MTZ9ER0fPpcvqzvvdjgNXXV3dsGfPnhGi1jdX5/Ih3OJy3HHHHW4LC5gvSXTupHtfxM3aLXJJID8cHh5egCDJNTU1DmxZQzQrJ01Fw0AoqcPQuNGGsKVts9ku1dbWvp+Tk7NaYutosONAGBFfQIO1cyzkImcYRsaZqQmBd2NiYm5FLLfi4mIHzWE6zGNKeCOX0FduiTXMZbC04ScuzHM0Nzba7fZtqampOyXBQONuCTjkojQYDC/cc889wuryzTffHGrxlkuC4vjs2bPdHqARMI8KdqrEpxnVkk+XhVYtM81m803t7e1xo0aNinfNHkGvOcrKynqUfyPAKgKtKv9GMMSOjo5a6hx/lw+TFLNoCymeCvLvYxgmsARdLuY2Em9TTSaTheanWCX4fH/zGs1/+uTk5KuHRU+dOtUcGRl5rqur6xMScH+QNYbqg5zuCLh4m81Wt2LFinBRMyJyc+K0KYm3/CEs+MIjR45sfuyxx9x+wwcffIAfCRLHEvMmFvlyhQUzwzAMEyzzWrM3DQ+D+sDV1dU9ee7cOWHxhm3IuLi4WlKqQynesKd8v8i9w6QJ609iYiKLN+9ilTgvJcMwDMPzmioGjQMXExOzVDQiOkTQt7/9bTuJt1uHujSHDx+ec/r0abf/fuzYsVJtbe1n3A4ZhmEYhvFXBrTAwfetqalJyPoGv7e1a9dKzc3NG41Go3WIny8+PT19uMj9w7EwLi7uIDcNhmEYhmH8lQEtcAkJCU+JJqpH0lXE5kpNTX3SD54vX3TrF6cd6d7f56bBMAzDMIy/MpAFLjc8PDxaRMDB+oYgdAis6g8PV1FRcb9I/Dfcf0pKCk6rFnHTYBiGYRjGX+nXAme1WrccOHBAKDZSYWEhRNMxyU/CPZAA/ZaIBQ4xx8rLy6u5WTAMwzAM48/0a4FLSUmZJGp9mzx5Mqxvc/3k2eJTU1PjEEnZXXD4oru7m/3fGIZhGIbxa/qzwOW3tLSEiWw/wvft/PnzpZL/hIaYdeTIEaE3wP8tOzt7NzcLhmEYhmH8mT4tcBUVFUs++ugjoQ9CLi+z2bzKXx7s9OnTq0Wsb0hvkZWVxf5vDMMwDMP4PX1a4OA7JiJ+EHqD3nOZft3vJ88VP3bs2GzR7VMSfWe4STAMwzAM4+/0ZYFz+o6JOP/D+lZXV/eXpKQkv3goq9W6uLKy0u0ks2Dy5Mnw43udmwTDMAzDMIEo4HJLS0uRINXtE6jwHcvKyvqNvzyUwWAQ2j7FAYy8vDz8upObBMMwDMMw/s6XtlDr6uruOnPmjFD4ED/zHcuNiYlJEBFwsL5VV1c3Spybk2EYhmGYQBRwlZWV4y9cuOD2B8B3jN6DvUq/SP6O+HUk3nSi26d2u30bNweGYRiGYQKBL22hmkwmy/Hjx93+AJze7OnpsfrJ88QnJyfnrVixwu038PYpwzAMwzCBxpcscB0dHbEiHwABd+7cufP+8DBnzpz5xaeffqoXsSDOnDlTOX1q5ebAMAzDMExACrhx48bFiwTwBZMmTfrID54lPi0tbf7vfvc7oTfNnTtXGjt27CpuCgzDMAzDBAp9BvIV8R/zF2B9o/vWi4Q/gf9eRESETfKf+HUMwzAMwzCDotfiQ+rq6uKG+DkssL4988wzQm9C+q/GxkaO/cYwDMMwTEARrsWH4OSqyWQasoewWq1/LCkpEfJ9g+/ezTffbDcajY9wM2AYhmEYJpDw2AIHfzmcXB3CZ8in779uy5YtQm9avHix1Nra+o7kJ+FPGIZhGIZhVAu4hoYGG3Kbigi4pKSktCG6/3i634Mk3oTivsH6VlBQIJnN5iXcBBiGYRiGCXgB19TUdBGx0dwF25atra34nFxf33xVVdV7//jHPwx//vOfhd4H61t1dfVBiUOHMAzDMAwTDAIuPDy8GhYqEY4fP66rqKhY7csbt1qtj8bGxk7YuHGj0PtgXZwyZYqdrW8MwzAMwwSNgOvq6vpEVMAh9lpSUtI99Gu8j+4712KxvLB06VLhkCfLli2Tzp8//6rE1jeGYRiGYYJFwGVnZ/8B8dFEgB/cqVOn9IjF5gvx1tHR8SlChogGHEbO04yMDPj48clThmEYhmGCR8ARRaICDkBQpaamLpC86wvnFG+bN2/Wi/q9wa8P1rfa2tqHJT55yjAMwzBMkAm45qqqqhZYq0TAYQacBoXA8pKIUy3eAA4uOByOspycnP/gamcYhmEYJtgEnNTd3f2uqIADEFaHDh3Say3iSFCupx8n1Io3WBTvvPPOnpEjR36Tq5xhGIZhmEBH53A4+no9t729/fi3vvUtnZoPnTFjhrRmzRqk2NpiMpmWe3B/FmRZMBgM1z/22GPCPm8AW6f79u2T6uvrV1gslp9zlTMMwzAME+j0l4mhuK2trQlCTA2wki1YsEA6d+5cYUNDQ6dsQRM5oWqprq6Gqa38448/vn7+/PmqxBtYu3Yt4tQdY/HGMAzDMEyw0J8FDiwgEbXznnvu8egLsH2JpPF5eXlSeXl5dXd398Hs7Ozd0pWDBMWKYMNVV1d3V09Pz/fNZvOIgwcPSjt27JBE8pv2Bn5v06dPb0lNTbVIfHCBYRiGYZgQEHBIq9X58ssvG9T4nfUGW5nwq0MgXVxpaWn25ORkpwWwvb3dAQsbiTXd8ePHpcOHDwvHd+sNrIfLly9HsvqbXYQiwzAMwzBMcAs4YlZ1dfVb2ML0VFD5EgjE7du3O6Kjo2fTP/dzNTMMwzAME0zoB/n//Qi9ga3IQBNvdXV1K1m8MQzDMAwTigJOQugNhOBQE1ZkKMUbH1pgGIZhGCZkBZzkzBtv/cnatWsdEEgs3hiGYRiGYfxfwEnIXtDS0vI0BJI/ijhYB1m8MQzDMAwTKgx2iOELWK3WoqSkpClLly5VHZdNa+Cfd99999nPnj37Y06TxTAMwzAMC7g+QFDeuLi4JzZu3KhDuI+hAmFJNm3aJKWkpCDOW77EoUIYhmEYhgkR9KJvILH0ZEVFxY+eeOIJ+7Jly5xCytcgxtubb77pMBgMB+UgvSzeGIZhGIYJGYQtcC5YKisrD0VERGQgY4IWwX4HA1kdsGWakZFhS0xMLKCXirgKGYZhGIZhASeI1Wp9NCYmZmNXV5fBW0JOEW7XXnttz8WLF39lMpmWc9UxDMMwDMMCznOQO/XnJOYSDh8+7PSP88RHbuTIkc7TpXPnzpUiIiJsdrv9ZRJu6yXOacowDMMwDAs4h9afmVtRUbGahNzMhIQE44kTJyRcOLXa1tbm/L0vsWY2m6WxY8c647mNHz/eERsba6+pqTlqsVi2SJxRgWEYhmEYxqsCzhULXfklJSVzhw8ffh39PiI9Pf1Lpx5sNlv3uXPnmru6usrj4uJwMOEtiQ8mMAzDMAzDDImAYxiGYRiGYTTm/wswAHjZZcLrtEraAAAAAElFTkSuQmCC')`
};

const propTypes = {

    apiKey: PropTypes.string,
    dataset: PropTypes.string,
    graphistryHost: PropTypes.string.isRequired,

    pointSize: PropTypes.number,
    edgeOpacity: PropTypes.number,
    pointOpacity: PropTypes.number,
    play: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),

    showInfo: PropTypes.bool,
    showMenu: PropTypes.bool,
    showLogo: PropTypes.bool,
    showIcons: PropTypes.bool,
    showArrows: PropTypes.bool,
    showLabels: PropTypes.bool,
    showToolbar: PropTypes.bool,
    showInspector: PropTypes.bool,
    showHistograms: PropTypes.bool,
    showSplashScreen: PropTypes.bool,
    pruneOrphans: PropTypes.bool,
    loadingMessage: PropTypes.string,
    showLabelOnHover: PropTypes.bool,
    showLoadingIndicator: PropTypes.bool,
    showPointsOfInterest: PropTypes.bool,
    precisionVsSpeed: PropTypes.oneOf([
        -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5
    ]),

    vizStyle: PropTypes.object,
    vizClassName: PropTypes.string,
    allowFullScreen: PropTypes.bool,
    backgroundColor: PropTypes.string,

    nodes: PropTypes.arrayOf(PropTypes.object),
    edges: PropTypes.arrayOf(PropTypes.object),
    bindings: PropTypes.shape({
        idField:  PropTypes.string.isRequired,
        sourceField: PropTypes.string.isRequired,
        destinationField:  PropTypes.string.isRequired,
    }),

    type: PropTypes.string,
    axes: PropTypes.array,
    controls: PropTypes.string,
    workbook: PropTypes.string,
};

const defaultProps = {

    play: 5,
    pointSize: 1,
    edgeOpacity: 1,
    pointOpacity: 1,

    showInfo: true,
    showMenu: true,
    showLogo: true,
    showIcons: true,
    showArrows: true,
    showLabels: true,
    showToolbar: true,
    showInspector: false,
    showHistograms: false,
    showSplashScreen: false,
    pruneOrphans: false,
    showLabelOnHover: true,
    showLoadingIndicator: true,
    showPointsOfInterest: true,
    loadingMessage: 'Herding stray GPUs',

    vizStyle: {},
    vizClassName: '',
    allowFullScreen: true,
    backgroundColor: '#333339',

    nodes: [],
    edges: [],
    bindings: {
        idField: 'node',
        sourceField: 'src',
        destinationField: 'dst'
    }
};

const handleETLUpload = mapPropsStream((props) => {
    return Observable.from(props).startWith({}).pairwise()
        .switchMap(([curr, next]) => {
            if (typeof next.dataset === 'string' || (
                shallowEqual(curr.edges, next.edges) &&
                shallowEqual(curr.nodes, next.nodes) &&
                shallowEqual(curr.bindings, next.bindings))) {
                return Observable.of(next);
            }
            const { apiKey, graphistryHost, bindings = {} } = next;
            const { nodes: labels = [], edges: graph = [] } = next;
            if (!graph ||
                !graph.length ||
                !apiKey || !bindings ||
                !bindings.sourceField ||
                !bindings.destinationField || (
                !bindings.idField && labels && labels.length)) {
                return Observable.of({ ...next, loading: false, dataset: null });
            }
            const type = 'edgelist', name = uuidv4();
            return Observable.ajax.post(`${graphistryHost || ''}/etl${''
                }?key=${apiKey
                }&apiversion=1${''
                }&agent=${encodeURIComponent(`'client-api-react'`)}`,
                { type, name, graph, labels, bindings },
                { 'Content-Type': 'application/json' }
            )
            .map(({ response }) => response && response.success
                ? { ...defaultProps, ...next, loading: !next.showSplashScreen, ...response }
                : { ...defaultProps, ...next, loading: true, loadingMessage: 'Error Uploading Graph', dataset: null }).catch(() => Observable.of(
                  { ...defaultProps, ...next, loading: true, loadingMessage: 'Error Uploading Graph', dataset: null }))
            .startWith({ ...next, loading: true, loadingMessage: 'Uploading Graph', dataset: null })
        })
        .scan((curr, next) => ({ ...curr, ...next }), defaultProps)
        .distinctUntilChanged(shallowEqual);
});

const withClientAPI = mapPropsStream((propsStream) => {
    const { handler: iFrameRefHandler, stream: iFrames } = createEventHandler();
    return Observable
        .from(iFrames).startWith(null)
        .switchMap((iFrame) => iFrame ? GraphistryJS(iFrame) : Observable.of(null))
        .combineLatest(propsStream)
        .switchMap(([g, props]) => {
            if (!g) {
                return Observable.of({ ...props, loading: !props.showSplashScreen, iFrameRefHandler });
            }
            let operations = [];
            if (props.showIcons                ) operations.push(g.encodeIcons('point', 'pointIcon'));
            if ('pointSize'            in props) operations.push(g.updateSetting('pointSize', props.pointSize));
            if ('edgeOpacity'          in props) operations.push(g.updateSetting('edgeOpacity', props.edgeOpacity));
            if ('pointOpacity'         in props) operations.push(g.updateSetting('pointOpacity', props.pointOpacity));
            if ('showArrows'           in props) operations.push(g.updateSetting('showArrows', props.showArrows));
            if ('showLabels'           in props) operations.push(g.updateSetting('labelEnabled', props.showLabels));
            if ('showToolbar'          in props) operations.push(g.updateSetting('showToolbar', props.showToolbar));
            if ('showInspector'        in props) operations.push(g.toggleInspector(props.showInspector));
            if ('showHistograms'       in props) operations.push(g.toggleHistograms(props.showHistograms));
            if ('pruneOrphans'         in props) operations.push(g.updateSetting('pruneOrphans', props.pruneOrphans));
            if ('precisionVsSpeed'     in props) operations.push(g.updateSetting('precisionVsSpeed', props.precisionVsSpeed));
            if ('showLabelOnHover'     in props) operations.push(g.updateSetting('labelHighlightEnabled', props.showLabelOnHover));
            if ('showPointsOfInterest' in props) operations.push(g.updateSetting('labelPOI', props.showPointsOfInterest));
            if ('axes'                 in props) operations.push(g.encodeAxis(props.axes));
            if ('workbook'             in props) operations.push(g.saveWorkbook())
            return Observable
                .merge(...operations)
                .takeLast(1).startWith(null)
                .mapTo({ ...props, loading: false, iFrameRefHandler })
        })
        .distinctUntilChanged(shallowEqual);
});

function Graphistry({
        style, className, vizStyle, vizClassName, allowFullScreen,
        play, showMenu = true, showLogo = true, showInfo = true, showToolbar = true,
        showLoadingIndicator = true, showSplashScreen = false, loading, loadingMessage = '',
        backgroundColor, graphistryHost, iFrameRefHandler, dataset, type = 'vgraph', 
        controls = '', workbook
    }) {

    const children = [];
    if (loading) {
        const showHeader = showMenu && showToolbar;
        children.push(
            <div key='graphistry-loading-placeholder'
                 className='graphistry-loading-placeholder'>
                {showHeader &&
                <div className='graphistry-loading-placeholder-nav'>
                    <div style={loadingNavLogoStyle}></div>
                </div> || undefined}
                <div className='graphistry-loading-placeholder-content' style={showHeader ? undefined : { height: `100%` }}>
                    <div className='graphistry-loading-placeholder-message'>
                        {showLoadingIndicator &&
                        <span className='graphistry-loading-placeholder-spinner'/> || undefined}
                        <p>{loadingMessage || ''}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (dataset) {
        play = typeof play === 'boolean' ? play : (play | 0) * 1000;
        const iFrameClassNames = 'graphistry-iframe' + (vizClassName ? ' ' + vizClassName : '');
        const optionalParams = (type ? `&type=${type}` : ``) +
                               (controls ? `&controls=${controls}` : ``) +
                               (workbook ? `&workbook=${workbook}` : ``);
        children.push(
            <iframe scrolling='no'
                    key='vizframe'
                    style={vizStyle}
                    ref={iFrameRefHandler}
                    className={iFrameClassNames}
                    allowFullScreen={!!allowFullScreen}
                    src={`${graphistryHost || ''}/graph/graph.html${''
                        }?play=${play
                        }&info=${!!showInfo
                        }&menu=${!!showMenu
                        }&splashAfter=${!!showSplashScreen
                        }&dataset=${encodeURIComponent(dataset)
                        }&bg=${encodeURIComponent(backgroundColor)
                        }&logo=${showLogo}${optionalParams}`}
            />
        );
    }
    return <div style={style} className={`graphistry-container ${className || ''}`}>{children}</div>;
}

Graphistry = withClientAPI(handleETLUpload(Graphistry));

Graphistry.propTypes = propTypes;

export { Graphistry };
