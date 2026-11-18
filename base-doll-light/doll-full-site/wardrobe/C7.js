// C7, the masquerade gown (C7A.png, C7B.png): a floor-length ball gown of black satin; a boned corset bodice, black embroidered in
// bronze-gold scrolls, with a sweetheart neckline in front, a low curve across the back, and a point at the waist front and back;
// off-the-shoulder bands of black satin round her upper arms; a very full gathered satin skirt falling in deep soft folds to the
// floor; long black satin opera gloves from above her elbows; a black velvet choker; a gilded Venetian eye mask tied with a black
// satin ribbon in a bow at the back of her head, its two ends hanging; plain black court shoes, just showing under the hem.
// The embroidery, the folds' light and the mask's gilding come from the paintings; the folds, the mask's relief and the bow are real shape.
window.DOLLWEAR_DEFS = window.DOLLWEAR_DEFS || {};
// The mask's gilding and its lacy outline, cut from C7B's front close-up (twice the detail of C7A's), laid out flat over the window
// x -0.070..0.070, y 1.468..1.564 (metres, her at rest); everything round the gold filled with gold, so an edge never reads skin.
// Made by /home/claude/agents/C7/masktex.py (the gold found by its hue; the alpha: the gold with its gaps closed, less her eye holes).
window.C7_MASK_PIC = { win: [-0.070, 0.070, 1.468, 1.564],
  rgb: 'data:image/jpeg;base64,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',
  alpha: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAADcCAAAAAAkKCf6AAAjrUlEQVR42u19+Vcbx7J/dU/PjDQjkIRWtIAhMTZgx4CN3/cmue8l9/3dL9u5yb0xscELYIODFy0gCW0gjTRb9/eHESCEtpGEQ25UJ+f4HByj0qeru6ur6lMFMJaxjGUsYxnLWMYylrGMxbagm60dAsbGAA4qmBcJGKpOxwAOhp8UiLqhnMopNxlB7gbjF3/07d/uRzmlZtzgbUxuMH7r36wGIDcFalodAzgIfv9YjznBBYVkXmPjLTwQfjKHOXzy/rB2cwHENxi/uIwBOGcw6uHHl8gg+EkYABAYhcSxNrZAO8IHVr5Zj0mWbrwnGnDgMYB2fFMxtrYaky37A+wMRL08GgNo41iRQrMhZwM/QGL4TtyFx2egnRNw7WHcgQAa/2G9kFfMG/po4m5c+ICTY4++XvKS82cm5jhWr4Mo8gBsDGB34xOcDim6/u3DaQe6sDgsyJLTF416CGM3LjiDblj4ICSQz76yPJiGagyAKrlUSVcze/uJ48oNC86gG4VfbHXZBbGlmIShGUCgumpQo5TY33lzkK3RMYCd8Hv8zX2ZTXiduFkzBgDAGDC9evxx+5ffDtVxMKGj+/w4JgDHXcIPELNi04B52TtRTdys0MLNARDxweXlqIzRlZ2BGnaIODzhmRDx2JHu4sQg1OFkQQgAEGJACB67Me3Rw44pn0wuUGwDIdNP84WqycYAthFmgjvq41G3ew0R3iwXblKSBN+o/dtbXdEXC8nc+Axs68VElpeDvcIuVC2VbpQjSG6QF7j+zUqga+wZMaC1UkkDDDcm4c7dvCB0Vxtk2snxCRMcDv6GQHhDAMTO2Pq3j+IS1+txhIgoOHyxmagb9BuRLiajdkU4bJqs4fv2/wU57+L6XS/p4xZxRoV4yaBq+tlmso/bGFkvQXRtgbARAYgIR02GeMHhEqolgycIMWajrIWTppwFqgYkDMBQj7vGZzCmZ/tJuGOeB12nZ39wnDlyqx0NgNgx5dIUk3OH/H7x8ED3ThLEjFIqV2ccNs3eMJrVBM9P3Fs9yyR1vkUAiwIDoHIfCXfOGQhCNqcJgSBkc6rglarFUaeYybDBHGbFAe7P6mVdCM5HPDixb0QDAmJqeuvlMZWESrFGMcd1xdEo7iRAPtShDwStwIIUmg06q2ZHn5IB4l2R+4uwu13yLC/Czov81MJUYkfXbxCAja0BiA+vPRLrJnEHPSK9dZdNTRIAPRcOp9mkmNpJqYJHrha7+G+spudBqIEgRsQ+wm/MSrh7y5R1qIvjTJ33zy89ugu3Isf+B3dY1JWKPHDwifwNAhA5AiGUzSkUsOCZCXOAiEgQyEEmEARAJyZmy8yJDiaeF923g0e73Q59putIT72KzAWEPkKUiAFyhO/s5PQ2Jog4RyDiUkrC4qOluQBM3aq4pv1swp0JxI/5hhHfDADJ1P0VfncrqQBQk3OJyAqZiIJlJ1iK+AzAZlgOHPuWg6kJlOh6bTKq1XXKet0iZwgS3+e3P1TMNtYnBe8/8J+kydL9iIsH0W9yIs/irqpTMCZkQTdtnU7XCSAnR+4FIgJKqqLbKxGuNcptHfdMdM5UXGF5VgBIKpR1VhiRCf8E6d91DM/6ji5fIwhhRyAWmlm9560VUTDg5ABEgSEE4BRMbE7fO1SSVdrNmWgc1Wen05AAdq9RNqu5wsx9DLgQun3LTVpc4LPjHqSIz+RETsYIcFo1DNrpODUw0zWDoSFKgnkhcH91JhQLiGYE8Tw+jyQCxjzQwKpOIamwDv4Mdkw1jmrsDIQg209tLNc1yShJZ08m1O5yNDTwRsMSyEtf3vPxLQAi1AjsISKIIsG85BIZJ3NGu2gelsJzQawjOeCTuf4SNbSy/+t2wbj0O24v3F75+m+Lca+DEEEgqFkNAEDE6RK1iir4A0KTGogXMGMAIEw/uO9R6wZDwvTDv98RWmpj22JA+qpRxrzImVfcYlY/3InNza27sqGlIN/D7wAsxZF8+/hgu81dwkmxB8uw86p2nFPMPmvZjMLbt5fxi6+sRWVvNODg0PlBgi5OFQaApTgA3qa3/KmXR2qTE6uWqzrlXPNfLxw59JSGXfNf/heZxlpKvXy1X30akEvxXgYtCk3D4bNnSVUIRl2V9CWLRoSjDAFw0sREVfY6O0UB0PmGxlJcvl1+I6OkYrZsPVd09X+WITqRnus72Mf0/MfMhWOEOGds/ZvVoMCL1sa9qg2ydEBClM1PvswVNMRxpsEQH7ofVz68z6qO6PKDhZl6pkQdkaV7n/FiJVM2zPMjNxhpxaAJQMyLBF16e53VKGcmVKUwdf+/woXNraZbFDm9cl0N3FsOOnjRtBJpPd8QzpBPnRIwn7qUHcfO0PzS49UITLgzoWUv1//zUeBV61LCvCiFVr9ZjzmxtV1RRx2kmDjH3NWPPMLilFQt1pFr/qv75tuN54WptcefBZyf3/rAwmuP5ydJ5O7rj+fXPB96+Miff7aZbPFmyflu9RCj1KAUIARIiq3/Yz3mZGJx53Vl4tbaZ1U/DxcIEu9SvHIS/3olwGPM95FiRgwAC7xIMJncOcg2LQUfevjl8nzQCXFXw5T7TeKllKQGpkmxFIiFZtdW4mfPGNRFBykSoMb7msqE4HIguZvnI8sryyTukVPRr1dDAueQZW75q5WggKTwrO+wcc1zrvm/fe0vTKhVrQ2AWIqtrkUELf1sK2EdeIwLP/zHekzGjBBgwJDTFxQRY4kG/oiT4w+F+vTSxdML9WGDgDg5Lgbnn2yeLwXCrvkv/z4zwWNwCn2YMjSlkTVwVlGlqImxlbXZUCwg4R56NN7S5knlRAX51poXJSq+L9bnp4hTmMyEFqNiPfMurU7O35l2YlPXjEYoB7AUXbo363LMhGVOvwogH1z737UgMbI+HpJ1MRCZ0OCsQgULronTCZfIO6MP1UpFowCY4yioVeHupGfKifsub0CNkzDqDk4Sy5gxx4EYXVqe8XDI8jT6r5bAUgz4SAXSe2Xvyn+vhiTr8Ou9D4Cpmf13J0J43qcUanxk5X5IwHLcVZW9opp6+s/XStjnFjGtpV9tZ3XAPI8MIbr2eH4CtcknEADgXHOPH96SMHUJGOHC1BergboWtYwLCaF7+UDsXkhAxBUKypwO2OmVlVP9pD4Zlwi2VR5iWQAReAyQVBh2eF1MfvB4foJD9qtNsBQT5zTz42zev7oSc3Kor30ADMzi7pM39fD9udPt10XREwk4MGCnYHKcUdz9Zavouz3vJaBnN398njM5RyCITx33vlkN8nq9VFLbAEimbt+NyBxgOQYgpKJfrnh13dU4jfjgqpgJLQW4WvbtXrpqIiTFFsO599xMxCPxyGZ5DWIAwMkxAMBHVAwsRMF1byXII7tVOo3jzM+Mmc8rrkhAwv2Db1azh/Xgg8fy872jusg7eNxwtBmtZtI1/+rXy1OEVt9vbKap7AzeW+KP+XsrMQlxcij2sXr5HiYAiPfNhiUMAFiOo4lMaDHqYPTsNMLOmGwZ97Nftw8KJpLi619Fs2/R8tIUQbbLkxAwACzHAcTfsWfm3iwnhAI9MyGdjzNgcsDk+tm9zU/Q0BxE/rZ4socRFhw8vvCF5NAcRL56FHMio/xuPwvhaGhm9a54ioMBCQPnXTqtKJfDuMRKaevWCwpLl29Cy/mwjHvnp1+TpzpI8fVvH/mqixAMOvEg1V1n7pgrJfoDES9BAj9QbtW6lAA13ro2VOG8y7AYWvSX72fq+VDEQ9BZ+U3jb2ISZsZJtgiRlbXZUNTPG9azEDujK7mPl8O4BIDp2Z1bU6Jo2VvzTYisb9sw7sRR2QAhsPLN45jTGwKeHzCn3EDQVRFcDpFvKD/AAxg1P7jt/AbsjEpV2Ss6Vg2Siq9FRdTyN04MVC2XdN8X//swJIkXBwx2eAMTHGoBEPT83txnAQGdodWsTuN/RpwcCLlKBojRtdWYjIkw8Pc+t2s/5jAaskwRDZgDFEyOw1IMXJnQUnMu+syAqJLee6f4lr+4JTffb8D0unY5vEKaayouoEWttWWc5046UdQZ7402bV00hA1i/o+p8bz48LYHFuYBgCrJp//cLnqIwDdf7gyorgJutUDsPK+pQF0WbXrx96yuCrIs4KG/dbuV+qQIXra31r+hSnLju42kefwhG2uudgfg5Ej8fVW9HM4Swo/+cbksvi2CHGG1CoQfrERENPT3RmcC8MdUITYibRzhmg2n8XMt8/T/niQVE8mRadel6BriWDF5Ka1CAAmh5fvR3skwPrhq8o0z92a3qhh2GzA9u72dVkyOqtUWvxkRgcfoih8oSb0yOYhZrkfLmfsf3LEEIeIMz0ddLcEh4/T4xGg5A2ndwhn1rv+xEy75EwPLB5cPtRwEVr9euhRda5fQIwC0flLRHKgv18NOuOTPK3xghXkPYXptNdZiLohM+idJM5AEmHGSTM5Igg3XA/2HA4ilmBgvgzsaaL0aGLCWbCcBME4OM1V6s12PT18t6zOAtHli64Vk8cpTzqQIQ+989n8+bi0VTG2e2Mw4yZWN1pcI01WdMdSMIPurodY+k9gCAANghnY5o4wBmHb8Ll2lzbCxq0j+pRBsEmitP2mprcAAYBT2X6eVJgQtgmRdp39VBNtLOwMEDgAYNZFz0mm9hs+eg7XjnEYI+mtu4s4l7kfPty6zRTnr54ouTkgXJcqM1pLPX5UdToLGADYZID198/PL/JVLBKiSAAQobnmN1DRBS238kp4DScBj4JqdmPz+/mX8Gol1qiSxMOESMADQWvEUVV/+uFmDxarJj1G7EKokdhMtZcWN0g5aL6QyVZMHoEpyJwnVVy+K/sjNYqX98WKUP7wr6O1rY8SpaEjmAKiS2Pj5wNByVd/qV4veMYCXiXqt4a1zAPnAgy8XvRxQJbHx/bM8Bupf+/ZRzDk+AltKcuPvK+22MBKjqytRJ6a15Mb3vx27ggKZb5R2jKU5H3p7+W1OY20AJO7pgAMxo7j789MjeXHVi+KXm4+MBQCwwx9xE8TaV6hS3cRG9SiV1/zR+3OOSTt1Q39hIY0gQzmVOAWXyxEIShXl+ESKOMkYvyuXSD1/WG7zlGtwhZIHFYeEi8m8in2zIccYv6tuTP7Fz9vFdo406NnfEiKZP1ms0eb6+jFm0FLWdXRqtnVjaO0wj8lRNUVfZMF3dzHIjx/B7aoLvFdyauTcR9QAq7UDyOYdc4/uB8ZPuHYXxkQ4KOFOPBEGppLOIUMILy1Fxh40tOXjI9pKEyKXnyoadk6vPp53jZ9wnahvPfrGMM67/NVKkB/fIG2TaogIrX0dyGWqIiXe+TvTg5We/iUcwUqddgIQOb2yciJ4/G5xfABCh+5e1ZJidgKQeJdipY/c3XnvOBPSGcErzWpIU6wmtsbS3PK9KTIQfuzG5eRHr1GbJsIXAJpKQb+9KIUDA7gw7PwD2l9c7FOjeJHh7qIRGsV6NAFYfDPpWYu67BbfX4DHdM1oURghIvDoXGf0KdFjDDpqNDCIVxakKZxVP9yN3+V5e0EEdgGerpezrbEKRNxBN8FEJPgTYXiGHjVUgxodNOL5CxBtKMQM3WTdGOsIIWwniMDOddX1crakZA6yLb2EkBCcD4q8O+hxiDy2rfGA8DGqq/VStqyr2bYahSRP0M3z1qraWFRTKVU7v0TOi/XtwqdX85mSkjnIKKXs5colACDuoJsXg/PRQMjjtK3xYOgZaq2UyaUOsqpebquRRwrNhyRPyCfbW9SzWt72APKBlf9+YCOIwAAATEOtFRNv9zLVUras65reauGodEgwcYcC0floIGxX44GMr5o/yqUOUrlM2aBGW4143h30yKGFz+Nep0g46KtVDQBgh3zFR77omSBG13r1/mpVl+qV/FEu9eZtoqTrmt52UoCpIkClI4cnFIjesauxXfwa6/kmlcuU6qrOoINGqHTI856dz+9EA2Gfi8f9LCkD4CS3xCHWAUDinu7fg7HUrWXf7b1J5Y7yVb3zmAXGAEy1Uj5yeHdtaWwbvov1LNZVvXOLH8YsEHMftgPROwtzQWcfS8oAgNFufqAN+taZuukXG7uJYk01KOvpwptqpWxLY/vm17SevRViQPXKkdO7u7j+RaS/JaW1XLr1Um9qvMN7otMTfVVjNdQ92t346df9bEXts6khM9XT48P0YYGKfINmiEZoftpJ4un3/9zcS+YVg/apkFY7LRyfaiYRLPIB6o5f8unPOyWjc+ciftIn9/GMY2fq/vDzy9SpQe08JW1pbM/87K7n2aJWirni+ZJ208c43vp+41DtaIFM16WIX+gZSGAAQBVL3bxKbT/H+9e4f/wGW8+Gc1wt5E81sxHpQ50/Rc9s/fv3Cu3YO4tR5r417eyn9wBVEr99//PLVEUfoAC4T41t4TfwelrbolLMFZkkdYlCMQBmln/fPqxD5+ZjDLvCIRfXgz/PrAqu7/61N5C6VzQeEkE27Ho2lrRQE1ydEWQAQOtHu7tZrWv3NsY5nZhBt73FAEA7+u27Xz+e6gPXn1/SeCgEG/gNs57WklZPDckrk87q0Fry2b/ftF4hlwFkulKrnVSQ0D2iap7sfv+vj1U6VGBSq55q4tAInuP3ZJj1BABm1Ot8wCd2zGVQJbHx/dMjlXUF0KgVDz9kTJfU0ZthALSW2Ph573TIgQDMqFeGRvAcv41klQ4dayZev6uj6WiZ37570q4J7OUtbCjHh8fG5JTUpQmidvT0p5fD98JlRm1YBC/wSww/YYRRE09MtXfjGDDl7Q+/fGj3KaSlhlWvw8ejbrXlZuXdxousPpKKbQCAeO/m5Z8CPwA9+8IXdhOuQ7fCYqr9PLbWDpYURO9Utyexkd/bPRzJRI9mBAf/FaPCD2jtcPdO3NUJQKW1710HABE3GY1Mdm4MytTMXqJCR8UaOENwABNko8UPgFYSe/fC7ZsfmEqp2v6FQ672hXQ4u0xVYMZJtqyzUfEukoCJGBUH3nWbP2wkRzVhienl7EmHJsLtQqmdmtCa/XaqHgWC1SQ/GXITzr4JMgCz8u7Js6HvXxg0lNp+phIzKsdFtVur6snAJD9C7k96983xgFeSfvxmNz3CCV/8ZGCy3eY7D6X2NZTKPEmlTswu47uD8yFxdJE8Wvm4k6iag9WLJnY+VugIJ5OH5oMi6juU2gFAqp10HZtFRjsznunHFn+P2d7BRn5//3hUxzEAYEcg6iH9h1I7jkXDfNf25iOeGU+riTdtXkh9QKgevUmM8ABEvDfaIadBleTms5TaJ4DM6BqSHPXMeKYXU7lB/Epay6WKozRAV/xOuP3hpOe2ftrK6f1tYaYVkvmOeiEA4ltYnB5hCTCt51JXgxy9xSilcnU6wgLy6cUFX/uXnJbZfpnqcFvhNpzO3InBOp9JnGtu/Yvg6C5ipmbfZe3v4QH/WecrOPjF+lznd4jSaXwTabeFrW4TqPNH5ZuazMPw7IuSYtr3A02lVB2dx8q55jubBXZ0pu63+XnXfh0IADsjS0vRkTE5EefydvCxuv8zyevi0MhaFUUb3ATU5r7Hgh0AmVFKdx8Ez7nmH6/F5BEhiOXY7QE8SySGbo9Sh7Uu3AQsSB09t7b/hsiTHWOqyPqFglapjWTIHRIij76al7D9RtJYy2VOzVEN9vz2YcTRIZrKapnXr69mQzoCyPQ6uH0dY6oIABHJJY4IQc599+8rAcF+UBVjVjkqjOIa6TUYVcts/et1J0ehHYAU5GhsknT5SqNDEMsz61/Oy4PwKhA2CvnqCFS4wK+9ASpvf/x3SmX9D6XCosfj7BwnRmezdQCGDoVgObb2eM7F2cYPMeBcc49P9FGo0BU/YEYp3dnjbAug0+MRuzTEa0ZQMYeeyrw6qFPJB1cNCkPGUzmpB34Xjl3fAJrVo+SM1OWGO0ewdbrP4IuPBuhRN4JtgHlXdO2brvbXltzQ4xY2NOrofA83PgoRySXxxNTMwbuI9Fz8XlOVJJeoVeomG9QFlaaX1v/+sLsKrPbhxYc6swEgM+sKeLrmNhsIegNerBl0oGHdWJicWf92cPzOFlE06vpgGnCCO/7o26/uR7qrQCu/P0/YAhAYBTnS4x4GAERkn39CIIgy21+gv8XvC8EBtwEnTkburv/P/1vwd2sPwQC0zIvNQ9XeaMize7j3dB9RDi/s7CWO+ygKveSB8K7pL9aX5oPD9KZpHMVicH7jxWHFrgKyP76wdKdRLdtFBaZmDrpELToA6PR4e4Wdrek+UtQdW9izByHCvOyfOS+tHbw2BjWGXIV8vt2PdhWILywtxP0NYhYaONxGOrencJPuuTJruo9IZH98YW9nv0dld5PyosMbv93P4vc75EqUwwv2FViI+2W+twY94o4dACztzX4WEFCPbKNlhBwv++ML++fcgi7nIcK8aBEebvez+P0OuZKi7tiFAl0wRAg1KdCAr7sGTM0eZLo8GEkns/2YUSTSq2rFGmLMcbzsn1lusFssuk0riggBnCnfoNxwoyiSvtgGZwpYBJF2CiBe4Hl3iwK9NGBGOVvWbc8XNpXMh9uy3Lvu5xxCV9jiV1mErxaKEOIFgtAZYSnkabBtRlJkjloUSOUyZYOxqwrgBsnLpgJXG/f2AyBTk898Ql91P2cQCrI7XC9ZlMNWkprF2RQsytwZ7XBULIfLCmRyqYOsZvE0r1L2QpInaEeBXu+QzvOF9dwWj8/a0vb1DRDHiS7PtK6Xr9AkkRCcDwqYuJuVHyFTqUkBd7heypYNql1VQOTdFxxNGwp0R5B0rvvBYqMtbb9jMwFxnMCYZ7qVqGuxhhEitpW34VQ3LaLBWDsF8DnV2g6lt/sO7jzhmtbyqaOqyfdLakPnQ944kQHzTDdRxRu8dUDoGlsoNC8itFcADTCFrQ2LvM8R4ZwcDEiYof7rR1HTpDxOZB1a/lwj3xo1TerrqACyVUDCtKuc7f4ARLz/s1mnAcReBS6Cy/MGP3XvDgSjVYDppUw3L6bbkHqgShZNeJ32a5j/8KYzaHTTB/Sq0rV+hOvitXNq8uBUdJK/ai9GZk0f2EyrA1mgnnuaFMlnFTZ4Hf2fGLmmuumMOtAt3GhqmVGHYSL8ifFjDCGgtcPdvbwBg52BVNUAaxSGYyJco32g6/v9VFdNTiR69sXGu4o5IIAADMzqMEyEa26IdT0aWfydXLrimvapBz1JRQT6ZiLcCAQter9hTTC/Lo2oktjaPPY/WDBe7aR7FH+SvpgIQTfhPjmCrI1XYm2vall1XeOISqokN37YKnrS79mLg0qPbAvXH4/R5+LRH9GArc07kipHr5+/PrXoQNeikJZ5+n9P3pdOCqn9/Z41nFxfPEbknJQ+bVvGRieOus4uT6Nt0NO3i2JXevRQH11///O/31cNQ8nnyj1Z3AT6YlQRK7TFPgmE5w3YarksBAMODMBMijGlHAdKYuOHZ0f02BHoxKwc3fgVrQ/yBdcfOVphk14JX/8ubmqcSLWTxNNf9uo8aLVaJX+sGqVjjTOtdgN1nbPo0dfQQQoxqp2eKH2WfXF9MvQ5X1gm195gv+HCMqrVqqdHbzZ++vX3opJPffxwsLtXKO/tlomx/8O/PlZNZlJuckomo9bGarUpOEm12GfZFOnTmkuZDxDwXXOD84YLa1CjnC1VM3t7746h8MFDEDMVGpoqlmL54N52SqHA9Nzr2c8CAhp9Cy5qGlxoKfUup7HRAciM4mvY//xe9DodauveUHKpkq5mDzJKKZOv6KAeE4QYo2jCWVM/5APpM8eCMcbsRCv75u8UKzzXf8kZ6TMuW3iV8tzV+GtzqM+6/ynJrWfpul7OlnVdNUwAVbNCjKiKKa2cyFVrLhnnvjXvpgYZtTtNa6ntpODIvMj0SYLqE0BWyxYcJ87AdTnUjcNPq6Y2f9zM6tS46EZ49ocGAFTjTOtw5yT/pJK05haNUh+zuP39G8qfpnP6SC0QmKZrqZ35oCDja+qeSA1Dzb/febKZrFHokAijVD8vPkm9TJ5PzhrlzJXM+71TZqr9bmLODjfoOh1qWjtOJ57/9PPLQ8Xso1iOGZXM27cFMiGN1pdhWimTKVbrfdeuc7Z+uaKLrmtAkAFQJbX529bGRt8NxMxaIXtcZu4piRulb4UIb5byNjhkxGaXjWF6RHQ7/vTssx/elIrFWr+qU80grJzOVHxklFcxFqaiQZnTrwVAoMpZj4hR42ecHvz6JFE37LT/E6emvLMBQedGdhUzAKrmUxk7JEZit0fE67szo5x30/CdldSrndSJrWJx4l26G56f01ITI4hssYt3//NfdovXBiBQ5ehDflpAIw7/JjPvNw5O7RXbc3L0/q0p41UuvBwdFsHz0JlZOXjyLGWHQE/sNhYQCBp1+Dyx9exDJpm1Sd83ldzRpJZ4enhr6EHc1jbQGc/VUjs79jqpEJvMosi9pSCPRjTf4qx92A+bGUW1S9gxCq+qv7vSezU2ikHctJbNMq+zsPmkZwx6GAD5wIO/P/AT2phvgUaD33cbyZp9rgyrH568F6sVz6RF7BtqQWktubmtRyaPNzdtdqYj9jZwcHFh0lAo5UR+qKuPXWRcBm6fSFW9gikRPR4BKB5uQc3izo+bNY9USedsUu+I3baJBY0jqjoRCQzzhmJnzcRryWHar1ENEFSOPoZBshZ0YCs0q0eJ5AnmTNsnCWdzMB0tvN7d39pKdOsT2me+Q1GU0+Rv3w/Zvo4ZqlY/qSChV/vh7jUwajGdLtdU1Tb92J4F6rmt300gqu47EeVBrz5mvcRyqZJeTz/bGpKuSmspLRmaXV2ZFgnBg4xvYgCAJ299vpsZhP5u05GuZY4ZIArKVKri5+1PJWJnjUEq6Rdb6bpeSuWGbb9GlXRe2j9W7ri9U87GM93Oadhw5Qdl7do9A3UdAAAbTOAxQ833Aer/7KP17MHOxsucTg1VpyPInilVtbLvn1+eFgzE27/eqJI9eNV3CHUoAC/K3h08060Ci0ayk6G+rI/qqq7lXm7sHGTrHeN+9ht7J6r77jun9xynOBiQznZyv5N+aqlnv+4c5HT4ZAAy8zR3LKh12evEVNeB53vqzM6oyLlUsZraepGu6HSU0cRMXsxX0/wxf+9BTDpLxjcvaqdKEQCzuPPTr8nTwfQZEEA1/WxiplQKL0fFei4LwQunhqHOk+eoUa9lX26lqsVUrjbaRqNU01W9doBPHWlVj7g41ig/atUEXWnJxJhRPfp4VB6w/ceAW1jPbarh0skciBOZ59uwvBKTwDTb6QxNU/Kq+aPsx82XOU1XdTr6uZfWfOmqVl6MuTRd9joxslIqjXrz871yqc+VzkDwuAXE4FMCSJVk1aVidHhcePHjNhxSfpqWqrIVWLqaq7WSvaXE2zepbDJXp4wBXE8tBqgJNfPm9lRNjd4Ju3jQNYMhIvIIgCnne4U2FhuokstSD0iegeM5ZOBDRy+I0bCn8u7HjRRSXX5SeZMNLUYlzBrr3FCSmiZGai5V0tXM3ttEsXYNxnfJJVZS5cQrWYOZ1GLcDSfZskE8014OEy39fBuWH8ScmNYbi02V5NYrY3riMDlwIzgy8HLr4Lu9Fis8e5ZQUGo7Wsv+loqerEYkI5+FYMAJ9WJV9jigXqzyQuHVVrqulzN5e50BBrRDo3LEMfwx8WYhCLmDrC5M35vlyGT91U/bkKprQWIc72XDizEnKMmNH16pHqmSKhifGkBgWApMqb/vphUTVQ7+eZB7XfhQLd8N6292YflBBA53j4ILPjjeT4mO3HPL6TOuHT4AANPUEENKMfFqEk6yZZP4P0RBCOivnqehouYjgnb4Khs9ZRFIb3y3kdYJZ6oD9xIlw6RQ06+47YOKCUzP6HvVolapZV7Pmjt7KFVfhu1/pYIfpiG9/RGE03RuZE5ffwRLYHW9ckTA0HSGT0suSiZpNleDRD3hIUbpsPpBpcuwbTVCR0NoNkzDAmcgBFmrgSwinGlSzLumfCybR5EHy7DzIi9Pu6F8WKTIvM6Dr1vsw1o0zHEME6brFDAvEsQM1XTGHizD9tbQjeSHiYlingf9MjIc4UHXkTMQhGyuzokEDFVn6NPZXi9SseXTMAZYCgQhO/RLfMiwPLrq9VlNDBrQnpnATZQ2y3+TBP0JiE3or0gAHMtYxjKWsYxlLGMZy1jGMpaxjGUsYxnLWMYylrGMZSxjGctYxjKWsYxlLH8m+f8DMqsLVjPqyQAAAABJRU5ErkJggg==' };
DOLLWEAR_DEFS.C7 = {
  name: 'Masquerade gown', kind: 'outfit', hair: 'hair_bun',
  build(W) {
    const { sm, lerp, PI, TAU, cl, smin, smax, DOLL, BI } = W;
    const F = W.F, Fs = W.Fsnug;
    const LIFT = 0.005;                                   // the shoes' soles: she stands this much higher

    // ======================= materials =======================
    const corsetMat = W.paint({ rough: 0.50, env: 0.35, emis: 0.36, color: '#e4dad0' });
    const skirtMat = W.paint({ rough: 0.46, metal: 0.25, env: 0.20, emis: 0.27, double: true, color: '#dccbc0' });
    const MP = window.__C7maskTex || (window.__C7maskTex = (() => { const T3 = W.THREE, mk = (src, srgb) => { const img = new Image(), t = new T3.Texture(img); img.onload = () => { t.needsUpdate = true; }; img.src = src; if (img.complete) t.needsUpdate = true;
      if (srgb) t.encoding = T3.sRGBEncoding; t.anisotropy = 4; return t; }; return { rgb: mk(C7_MASK_PIC.rgb, true), a: mk(C7_MASK_PIC.alpha, false) }; })());
    const maskMat = W.phys({ map: MP.rgb, alphaMap: MP.a, alphaTest: 0.5, color: W.lin('#fff0cc'), metalness: 0.30, roughness: 0.42, envMapIntensity: 0.45,
      emissive: W.lin('#ffffff'), emissiveMap: MP.rgb, emissiveIntensity: 0.30, bumpMap: MP.rgb, bumpScale: 0.035 });
    const satin = W.phys({ color: W.lin('#191416'), roughness: 0.40, metalness: 0.15, clearcoat: 0.18, clearcoatRoughness: 0.35, envMapIntensity: 0.6 });
    const satinD = W.phys({ color: W.lin('#191416'), roughness: 0.40, metalness: 0.15, clearcoat: 0.18, clearcoatRoughness: 0.35, envMapIntensity: 0.6, side: W.THREE.DoubleSide });
    const velvet = W.std({ color: W.lin('#100d10'), roughness: 0.72, envMapIntensity: 0.35 });
    const shoeMat = W.phys({ color: W.lin('#0e0c0e'), roughness: 0.30, clearcoat: 0.45, clearcoatRoughness: 0.22, envMapIntensity: 1.0 });
    const handMat = W.phys({ color: W.lin('#191416'), roughness: 0.42, metalness: 0.15, clearcoat: 0.16, clearcoatRoughness: 0.36, envMapIntensity: 0.6 });

    // ======================= small geometry helpers =======================
    const norm = (v) => { const L = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / L, v[1] / L, v[2] / L]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const add = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    function merge(list) { const pos = [], idx = []; for (const g of list) { const b = pos.length / 3; for (const v of g.pos) pos.push(v); for (const i of g.idx) idx.push(i + b); } return { pos, idx }; }
    function orientC(g, ringIdx, cols, c) {               // flip a loft's triangles if ring ringIdx faces toward point c
      const nor = W.computeNormals(g.pos, g.idx); let s = 0;
      for (let j = 0; j < cols - 1; j++) { const v = ringIdx * cols + j; s += nor[v * 3] * (g.pos[v * 3] - c[0]) + nor[v * 3 + 1] * (g.pos[v * 3 + 1] - c[1]) + nor[v * 3 + 2] * (g.pos[v * 3 + 2] - c[2]); }
      if (s < 0) for (let i = 0; i < g.idx.length; i += 3) { const t = g.idx[i + 1]; g.idx[i + 1] = g.idx[i + 2]; g.idx[i + 2] = t; }
      return g;
    }
    function orient(g, rings) { const m = Math.floor(rings.length / 2), r = rings[m], n = r.length; return orientC(g, m, n + 1, r.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n, a[2] + p[2] / n], [0, 0, 0])); }
    // a ribbon: points with a width direction w and a face direction n; a flat rounded box in section
    function ribbon(P) {
      const rings = [], NV = 12;
      for (const q of P) { const ring = [];
        for (let j = 0; j < NV; j++) { const a = (j / NV) * TAU, ca = Math.cos(a), sa = Math.sin(a), cx = Math.sign(ca) * Math.pow(Math.abs(ca), 0.35), sy = Math.sign(sa) * Math.pow(Math.abs(sa), 0.35);
          ring.push(add(add(q.p, q.w, q.hw * cx), q.n, q.ht * sy)); } rings.push(ring); }
      return orient(W.loft(rings, { capA: true, capB: true }), rings);
    }
    // a smooth curve through keys [[x, [values]], ...] (Catmull-Rom)
    function cprof(K, x) {
      const n = K.length; if (x <= K[0][0]) return K[0][1]; if (x >= K[n - 1][0]) return K[n - 1][1];
      let i = 1; while (K[i][0] < x) i++;
      const x0 = K[i - 1][0], x1 = K[i][0], u = (x - x0) / (x1 - x0), A = K[Math.max(0, i - 2)], B = K[i - 1], C = K[i], D = K[Math.min(n - 1, i + 1)];
      return B[1].map((b, j) => { const c = C[1][j], m0 = (c - A[1][j]) / (C[0] - A[0]) * (x1 - x0), m1 = (D[1][j] - b) / (D[0] - B[0]) * (x1 - x0), u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * b + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * c + (u3 - u2) * m1; });
    }
    // the same for one value, without making arrays (it is called for every grid point of the corset)
    function c1(K, x) {
      const n = K.length; if (x <= K[0][0]) return K[0][1][0]; if (x >= K[n - 1][0]) return K[n - 1][1][0];
      let i = 1; while (K[i][0] < x) i++;
      const x0 = K[i - 1][0], x1 = K[i][0], u = (x - x0) / (x1 - x0), A = K[Math.max(0, i - 2)], B = K[i - 1], C = K[i], D = K[Math.min(n - 1, i + 1)];
      const b = B[1][0], c = C[1][0], m0 = (c - A[1][0]) / (C[0] - A[0]) * (x1 - x0), m1 = (D[1][0] - b) / (D[0] - B[0]) * (x1 - x0), u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * b + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * c + (u3 - u2) * m1;
    }
    const czT = (y) => { const t = W.trunkAt(cl(y, 0.87, 1.38)); return (t[1] + t[2]) / 2; };

    // ======================= the corset =======================
    // Its top: a sweetheart neckline in front (a V between her breasts, 1.223, rising over each to 1.262), down to 1.248 under her arms,
    // a shallow curve across her back (1.212 in the middle). Its bottom: a point at the front and at the back (about 0.998), rising to
    // 1.048 at her sides. Read off C7A (front: x = (col - 333.5) / 614, y = 0.035 + (1009 - row) / 614) and C7B.
    const TOPF = [[0, [1.223]], [0.010, [1.231]], [0.028, [1.246]], [0.055, [1.257]], [0.085, [1.262]], [0.110, [1.260]], [0.130, [1.256]], [0.170, [1.256]]];
    const TOPK = [[0, [1.212]], [0.050, [1.221]], [0.100, [1.236]], [0.130, [1.248]], [0.170, [1.254]]];
    const BOTF = [[0, [0.998]], [0.030, [1.008]], [0.070, [1.025]], [0.110, [1.043]], [0.135, [1.048]], [0.200, [1.048]]];
    const BOTK = [[0, [1.000]], [0.030, [1.010]], [0.070, [1.027]], [0.110, [1.045]], [0.135, [1.050]], [0.200, [1.050]]];
    const CZ_T = czT(1.24), CZ_B = czT(1.02);
    const topB = (x, z) => { const ax = Math.abs(x), f = sm(CZ_T - 0.05, CZ_T + 0.03, z); return lerp(c1(TOPK, ax), c1(TOPF, ax), f); };
    const botB = (x, z) => { const ax = Math.abs(x), f = sm(CZ_B - 0.04, CZ_B + 0.04, z); return lerp(c1(BOTK, ax), c1(BOTF, ax), f); };
    const corR = (x, y, z) => Math.max(botB(x, z) - y, y - topB(x, z));
    const corTh = (x, y, z) => {
      const et = topB(x, z) - y, eb = y - botB(x, z), ax = Math.abs(x);
      return 0.0058 + 0.0013 * sm(0.008, 0.002, et) + 0.0015 * sm(0.008, 0.002, eb)
        + 0.0045 * Math.exp(-Math.pow((ax - 0.052) / 0.045, 2) - Math.pow((y - 1.205) / 0.045, 2)) * sm(0.02, 0.06, z);     // the cups a little fuller, as in the side painting
    };
    // (as W.snug, but points well outside the corset's outline, or deep inside her, are not measured against her body: a little faster)
    function snugFast(key, R, th, box, h, o) {
      const TC = new Map();                               // her trunk's outline at each height of the grid (the grid's rows repeat)
      const G = (x, y, z) => { const r = R(x, y, z); if (r > 0.008) return r;
        const ky = Math.round(y * 1e5); let t = TC.get(ky); if (!t) { t = W.trunkAt(cl(y, 0.86, 1.38)); TC.set(ky, t); }
        const cz = (t[1] + t[2]) / 2, rz = z > cz ? t[1] - cz : cz - t[2], ux = Math.abs(x / t[0]), uz = Math.abs((z - cz) / rz), mn = Math.min(t[0], rz);
        const e = (Math.hypot(ux, uz) - 1) * mn; if (e < -0.045 && r < -0.008) return Math.max(r, e + 0.035);      // well inside the ellipse in it: inside her
        return smax(Fs(x, y, z) - th(x, y, z) - 0.0011 * Math.exp(-r * r / 1.6e-5), r, 0.0022); };
      const g = W.snets(G, box, h), keep = [], used = new Int32Array(g.nv).fill(-1), pos = [], nor = [], WT = [], idx = [];
      for (let t = 0; t < g.tris.length; t += 3) { let inside = 0; for (let k = 0; k < 3; k++) { const v = g.tris[t + k]; if (F(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]) < -0.0012) inside++; } if (inside < 3) keep.push(g.tris[t], g.tris[t + 1], g.tris[t + 2]); }
      for (const v of keep) { if (used[v] < 0) { used[v] = pos.length / 3; const x = g.pos[v * 3], y = g.pos[v * 3 + 1], z = g.pos[v * 3 + 2]; pos.push(x, y, z); nor.push(g.nor[v * 3], g.nor[v * 3 + 1], g.nor[v * 3 + 2]);
        const f = F(x, y, z); WT.push(W.wBody(x - g.nor[v * 3] * f, y - g.nor[v * 3 + 1] * f, z - g.nor[v * 3 + 2] * f)); } idx.push(used[v]); }
      return W.part(key, { pos, idx, nor }, (x, y, z, i) => WT[i], o);
    }
    snugFast('c7Corset', corR, corTh, [-0.162, 0.162, 0.982, 1.276, -0.128, 0.142], 0.0037, { mat: corsetMat });
    // ======================= the off-shoulder bands =======================
    // a band of satin round each upper arm just below the ball of her shoulder, 4.5 cm wide on the outside, running in under her arm
    // to the corset's top corners; a soft roll of cloth, its edges turned under
    const BAND = { top: (a) => 0.002 + 0.034 * Math.pow((1 - Math.cos(a)) / 2, 1.5), bot: (a) => 0.067 + 0.024 * Math.pow((1 - Math.cos(a)) / 2, 1.5) };
    const armAx = (S, sl) => { const q = [0, PI / 2, PI, 1.5 * PI].map((a) => W.armPt(S, sl, a)); return [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4, (q[0][2] + q[1][2] + q[2][2] + q[3][2]) / 4]; };
    const armOff = (S, sl, a, e) => { const p = W.armPt(S, sl, a); return add(p, norm(sub(p, armAx(S, sl))), e); };
    {
      const parts = [], WT = [];
      for (const S of ['R', 'L']) {
        const NU = 52, NF = 16, sec = [];
        const eOut = (f) => 0.0042 + 0.0040 * Math.pow(Math.sin(PI * f), 0.8);
        for (let i = 0; i <= NF; i++) sec.push([i / NF, eOut(i / NF)]);
        sec.push([1.0 + 0.0, 0.0028], [1.0 - 0.02, 0.0017]);
        for (let i = NF - 1; i >= 1; i--) sec.push([i / NF, 0.0016]);
        sec.push([0.02, 0.0017], [0.0, 0.0028]);
        const rings = [], SL = [];
        for (const [f, e] of sec) { const ring = [], sls = [];
          for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, s0 = BAND.top(a), s1 = BAND.bot(a), sl = lerp(s0, s1, cl(f, 0, 1)) + (f >= 1 && e > 0.002 ? 0.0016 : 0) - (f <= 0 && e > 0.002 ? 0.0016 : 0);
            ring.push(armOff(S, sl, a, e)); sls.push([sl, a]); }
          rings.push(ring); SL.push(sls); }
        rings.push(rings[0]); SL.push(SL[0]);
        const g = W.loft(rings, {}), cols = NU + 1;
        orientC(g, Math.floor(NF / 2), cols, armAx(S, 0.035));
        const nv = g.pos.length / 3;
        for (let v = 0; v < nv; v++) { const r = Math.floor(v / cols), j = v % cols; if (r >= SL.length) { WT.push(W.wArmSL(S, 0.04)); continue; } const [sl, a] = SL[r][j % NU]; WT.push(W.wArmSL(S, sl, a)); }
        parts.push(g);
      }
      W.part('c7Bands', merge(parts), (x, y, z, i) => WT[i], { mat: satin });
    }
    // ======================= the gloves =======================
    // close satin from above her elbow (higher on the outside of her arm) to her wrist, a few soft gathers on the forearm; the top
    // edge turned in, so it has thickness. Her hands wear the same black satin.
    const GL0 = (a) => 0.136 + 0.034 * (1 - Math.cos(a)) / 2, GL1 = 0.456;
    const glOff = (sl, a) => {
      const top = sm(0.03, 0.0, sl - GL0(a)), fa = Math.atan2(Math.sin(a - PI / 2), Math.cos(a - PI / 2));
      const gath = (0.0006 + 0.0012 * sm(0.30, 0.40, sl)) * sm(0.20, 0.28, sl) * sm(GL1, GL1 - 0.03, sl) * Math.pow(0.5 + 0.5 * Math.sin(sl / 0.022 * TAU + 0.5 * Math.sin(a) + 0.4 * Math.sin(sl * 61)), 2.5) * (0.5 + 0.5 * Math.exp(-fa * fa / 1.2));
      const elbow = 0.0010 * Math.exp(-Math.pow((sl - 0.27) / 0.03, 2)) * (0.5 + 0.5 * Math.sin(sl / 0.012 * TAU)) * Math.exp(-fa * fa / 0.6);
      return 0.0024 + 0.0010 * top + gath + elbow - 0.0010 * sm(GL1 - 0.025, GL1, sl);
    };
    for (const S of ['R', 'L']) {
      const NU = 40, NR = 64, rings = [], SLs = [], TH = 0.0016;
      const row = (fn) => { const ring = [], sls = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, [sl, e] = fn(a); ring.push(armOff(S, sl, a, e)); sls.push([sl, a]); } rings.push(ring); SLs.push(sls); };
      row((a) => [GL0(a) + 0.016, glOff(GL0(a) + 0.016, a) - TH]);          // the inside, turned in 1.6 cm
      row((a) => [GL0(a) + 0.0008, glOff(GL0(a), a) - TH]);
      row((a) => [GL0(a) - 0.0010, glOff(GL0(a), a) - TH / 2]);             // the rounded top edge
      for (let i = 0; i <= NR; i++) { const t = i / NR; row((a) => { const sl = lerp(GL0(a), GL1, t); return [sl, glOff(sl, a)]; }); }
      const g = orient(W.loft(rings, {}), rings), cols = NU + 1;
      W.part('c7Glove' + S, g, (x, y, z, i) => { const r = Math.floor(i / cols), j = i % cols; if (r >= rings.length) return W.wArmSL(S, 0.3); const [sl, a] = SLs[r][j % NU]; return W.wArmSL(S, cl(sl, 0.0, 0.446), a); }, { mat: satin });
    }
    W.swapMat('hand', handMat); W.swapMat('handR', handMat);
    // ======================= the skirt =======================
    const SKC = 0.0;
    const NA = 72, YB0 = 1.10, YB1 = 0.62, DY = 0.02, NB = Math.round((YB0 - YB1) / DY) + 1, BT = new Float32Array(NB * NA);
    for (let i = 0; i < NB; i++) { const y = YB0 - i * DY;
      for (let j = 0; j < NA; j++) { const a = (j / NA) * TAU, sa = Math.sin(a), ca = Math.cos(a), G = (r) => Fs(sa * r, y, SKC + ca * r);
        let r = 0.30; while (r > 0 && G(r) > 0) r -= 0.006; let lo = r, hi = r + 0.006; if (r > 0) for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (G(m) > 0) hi = m; else lo = m; }
        BT[i * NA + j] = r > 0 ? (lo + hi) / 2 : 0; } }
    const bodyR = (y, a) => { const fi = cl((YB0 - y) / DY, 0, NB - 1.001), i = Math.floor(fi), u = fi - i; const fa = ((a / TAU) % 1 + 1) % 1 * NA; const j = Math.floor(fa) % NA, v = fa - Math.floor(fa), j2 = (j + 1) % NA;
      return lerp(lerp(BT[i * NA + j], BT[i * NA + j2], v), lerp(BT[(i + 1) * NA + j], BT[(i + 1) * NA + j2], v), u); };
    // the painted outline: half width (front and back paintings), front and back of the middle line (side painting)
    const FL = [[0.07, [0.372, 0.283, 0.276]], [0.10, [0.370, 0.281, 0.274]], [0.15, [0.362, 0.276, 0.268]], [0.20, [0.352, 0.268, 0.262]], [0.30, [0.333, 0.253, 0.247]],
      [0.40, [0.313, 0.238, 0.232]], [0.50, [0.290, 0.222, 0.215]], [0.60, [0.268, 0.203, 0.200]], [0.70, [0.246, 0.190, 0.190]], [0.80, [0.215, 0.165, 0.176]],
      [0.84, [0.200, 0.155, 0.168]], [0.88, [0.185, 0.146, 0.158]], [0.92, [0.168, 0.136, 0.148]], [0.96, [0.150, 0.124, 0.135]], [1.00, [0.128, 0.104, 0.112]], [1.06, [0.100, 0.075, 0.065]]];
    const TOPMAX = 1.064, HEM = 0.066;
    const gAmp = (y) => lerp(0.0016, 0.030, Math.pow(sm(1.04, 0.10, y), 0.7));
    const flareR = (y, a) => { const v = cprof(FL, y), s = Math.sin(a), c = Math.cos(a), rz = c >= 0 ? v[1] : v[2], k = 0.85 * gAmp(y);
      return 1 / Math.sqrt((s / (v[0] - k)) * (s / (v[0] - k)) + (c / (rz - k)) * (c / (rz - k))); };
    const clear = (y) => lerp(0.0030, 0.010, sm(1.04, 0.90, y));
    const baseR = (y, a) => smax(bodyR(y, a) + clear(y), flareR(y, a), 0.03);
    // deep soft satin folds, gathered fine under the corset
    const fold = (a, y) => { const t = sm(1.04, HEM, y), ph = 0.5 * t * Math.sin(2 * a + 0.4);
      const fine = Math.sin(a * 40 + 0.3), main = (0.66 * Math.sin(a * 14 + ph + 0.9 * Math.sin(a * 3)) + 0.34 * Math.sin(a * 23 + 1.3 + ph * 1.5)) * (0.62 + 0.38 * Math.sin(a * 5 + 0.7 + t));
      return lerp(fine, main, sm(0.0, 0.20, t)); };
    const skirtR = (y, a) => baseR(y, a) + gAmp(y) * (0.5 + 0.5 * fold(a, y));
    const hemY = (a) => HEM + 0.011 * Math.pow(Math.sin(a), 2) + 0.003 * Math.sin(a * 3 + 1) - 0.004 * (0.5 + 0.5 * fold(a, HEM));
    // the skirt's top follows the corset's pointed bottom edge, 1.4 cm up under it
    const topY = (a) => { const r = bodyR(1.03, a); return Math.min(TOPMAX, botB(r * Math.sin(a), SKC + r * Math.cos(a)) + 0.014); };
    let skirtRows = 0, skirtCols = 0, skirtTopRows = 2;
    {
      const NU = 200, NV = 64, rings = [];
      const at = (y, a, dr) => { const r = skirtR(y, a) + (dr || 0); return [r * Math.sin(a), y, SKC + r * Math.cos(a)]; };
      const tops = [], hems = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; tops.push(topY(a)); hems.push(hemY(a)); }
      { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(tops[j] + 0.002, a, -0.0022)); } rings.push(ring); }
      for (let i = 0; i <= NV; i++) { const t = i / NV, s = t * t * 0.30 + t * 0.70, ring = [];
        for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; ring.push(at(lerp(tops[j], hems[j], s), a)); } rings.push(ring); }
      { const r0 = [], r1 = [], r2 = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, h = hems[j]; r0.push(at(h - 0.0015, a, -0.0018)); r1.push(at(h + 0.0005, a, -0.0040)); r2.push(at(h + 0.032, a, -0.0046)); } rings.push(r0, r1, r2); }
      const g = W.loft(rings, {});
      skirtRows = rings.length; skirtCols = NU + 1;
      W.part('c7Skirt', g, (x, y, z) => { const a = Math.atan2(x, z - SKC), t0 = topY(a < 0 ? a + TAU : a), u = sm(t0, t0 - 0.06, y);
        return u >= 1 ? W.wSkirt(x, y, z) : W.mixW(W.wBody(x, y, z), W.wSkirt(x, y, z), u); }, { mat: skirtMat });
    }
    // ======================= the shoes =======================
    // plain black court shoes: a thin shell round her foot, its toe a smooth round box over her toes, cut low round the opening
    // (her instep shows), a thin flat sole the shape of her foot. Only their toes show under the hem.
    const TOE = [[0.060, [-0.036, 0.048, 0.066]], [0.090, [-0.043, 0.053, 0.056]], [0.110, [-0.046, 0.052, 0.047]], [0.130, [-0.044, 0.050, 0.040]],
      [0.150, [-0.043, 0.041, 0.035]], [0.165, [-0.041, 0.030, 0.031]], [0.178, [-0.038, 0.017, 0.027]], [0.188, [-0.032, 0.004, 0.024]], [0.196, [-0.020, -0.006, 0.021]]];
    const S0 = W.SOLE, L2 = [0, 0];
    const TOE_T = []; for (let k = 0; k <= 160; k++) TOE_T.push(cprof(TOE, 0.06 + 0.14 * k / 160));       // looked up, not worked out, for every grid point
    const toeAt = (Z) => { const f = cl((Z - 0.06) / 0.14 * 160, 0, 159.999), i = Math.floor(f), u = f - i, a = TOE_T[i], b = TOE_T[i + 1]; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; };
    const toeD = (X, Y, Z) => {
      const v = toeAt(Z), xc = (v[0] + v[1]) / 2, rx = Math.max(0.002, (v[1] - v[0]) / 2), yc = S0 + 0.008, ry = Math.max(0.004, v[2] - 0.008);
      const ux = Math.abs(X - xc) / rx, uy = Y > yc ? (Y - yc) / ry : (yc - Y) / 0.012, q = Math.pow(Math.pow(ux, 2.4) + Math.pow(uy, 2.4), 1 / 2.4);
      return smax((q - 1) * Math.min(rx, Y > yc ? ry : 0.012), smax(0.07 - Z, Z - 0.2005, 0.006), 0.004);
    };
    const cutY = (X, Z) => S0 + lerp(0.044, 0.030, sm(-0.06, -0.02, Z)) + 0.10 * sm(0.085, 0.122, Z + 1.6 * X * X);
    {
      const s = 1;
      const G = (x, y, z) => { DOLL.toLocal(s, x, z, L2); const X = L2[0], Z = L2[1];
        const cy = y - cutY(X, Z); if (cy > 0.006) return cy; if (Z < -0.085 || Z > 0.215 || X < -0.075 || X > 0.085) return 0.01;
        const foot = Math.min(DOLL.fFoot(s, x, y, z), y > 0.06 ? DOLL.fLegOnly(s, x, y, z) : 1) - 0.0026;
        if (foot > 0.026 && y > S0 + 0.012) return foot - 0.020;                     // far from her foot: no shoe near
        const plan = DOLL.fFoot(s, x, S0 + 0.007, z) - 0.0032, sole = smax(plan, Math.max(S0 - LIFT - y, y - S0 - 0.004), 0.0015);
        const up = smax(smin(smin(foot, toeD(X, y, Z), 0.008), sole, 0.004), cy, 0.0025);
        return smax(up, S0 - LIFT - y, 0.0015); };
      const keep = (x, y, z) => !(DOLL.fFoot(s, x, y, z) < -0.0015 || (y > 0.06 && DOLL.fLegOnly(s, x, y, z) < -0.0015));
      const g = W.snets(G, [0.018, 0.146, S0 - LIFT - 0.004, 0.112, -0.083, 0.206], 0.0035), pos = [], nor = [], idx = [], used = new Int32Array(g.nv).fill(-1);
      for (let t = 0; t < g.tris.length; t += 3) {
        let ok = false; for (let k = 0; k < 3; k++) { const v = g.tris[t + k]; if (keep(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2])) { ok = true; break; } } if (!ok) continue;
        for (let k = 0; k < 3; k++) { const v = g.tris[t + k];
          if (used[v] < 0) { used[v] = pos.length / 3; pos.push(g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]); nor.push(g.nor[v * 3], g.nor[v * 3 + 1], g.nor[v * 3 + 2]); }
          idx.push(used[v]); }
      }
      const posR = pos.slice(), norR = nor.slice(), idxR = idx.slice();
      for (let i = 0; i < posR.length; i += 3) { posR[i] = -posR[i]; norR[i] = -norR[i]; }
      for (let i = 0; i < idxR.length; i += 3) { const t = idxR[i + 1]; idxR[i + 1] = idxR[i + 2]; idxR[i + 2] = t; }
      const wf = (x, y, z) => W.wBody(x, Math.max(y, S0 + 0.004), z);
      W.part('c7ShoeR', { pos: posR, idx: idxR, nor: norR }, wf, { mat: shoeMat });
      W.part('c7ShoeL', { pos, idx, nor }, wf, { mat: shoeMat });
    }
    W.onFrame((SK) => { SK.hips.position.y += LIFT; SK.hips.updateMatrixWorld(true); });
    // ======================= the choker =======================
    // a black velvet band 1.5 cm wide round her neck, a little higher at the back (as in the side painting), standing just off her skin
    {
      const NRK = [[1.396, 0.0355, 0.0195, -0.0668], [1.410, 0.0388, 0.0262, -0.0658], [1.424, 0.0438, 0.0345, -0.0660], [1.440, 0.0448, 0.0380, -0.0625]];     // her head's own neck (I40_head.js, the doll)
      const NC = -0.020;
      const neckR = (y, a) => {
        const sa = Math.sin(a), ca = Math.cos(a); let r = 0.075; for (let k = 0; k < 120; k++) { const f = F(sa * r, y, NC + ca * r); if (f < 0) break; r -= Math.max(0.0003, f * 0.8); }
        let i = 0; while (i < NRK.length - 2 && NRK[i + 1][0] < y) i++; const u = cl((y - NRK[i][0]) / (NRK[i + 1][0] - NRK[i][0]), 0, 1);
        const rx = lerp(NRK[i][1], NRK[i + 1][1], u), zf = lerp(NRK[i][2], NRK[i + 1][2], u), zb = lerp(NRK[i][3], NRK[i + 1][3], u), zc = (zf + zb) / 2, rz = (zf - zb) / 2;
        // the ellipse's radius along this ray from (0, NC)
        let lo = 0, hi = 0.09; for (let k = 0; k < 26; k++) { const m = (lo + hi) / 2, X = sa * m, Z = NC + ca * m - zc; if ((X / rx) * (X / rx) + (Z / rz) * (Z / rz) < 1) lo = m; else hi = m; }
        return Math.max(r, lo);
      };
      const yc = (a) => 1.398 + 0.009 * (1 - Math.cos(a)) / 2, HW = 0.0075, TH = 0.0016;
      const NU = 96, sec = [];
      for (let k = 0; k < 14; k++) { const t = (k / 14) * TAU, ct = Math.cos(t), st = Math.sin(t); sec.push([Math.sign(ct) * Math.pow(Math.abs(ct), 0.3), Math.sign(st) * Math.pow(Math.abs(st), 0.3)]); }
      // radius by angle: the widest of her neck across the band's height, smoothed round
      const RR = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU; let r = 0; for (const dy of [-HW, -HW / 2, 0, HW / 2, HW]) r = Math.max(r, neckR(yc(a) + dy, a)); RR.push(r); }
      const RS = RR.map((r, j) => { let s = 0; for (let k = -2; k <= 2; k++) s = Math.max(s, RR[(j + k + NU) % NU]); return s; });
      const rings = [];
      for (const [u, v] of sec) { const ring = []; for (let j = 0; j < NU; j++) { const a = (j / NU) * TAU, r = RS[j] + 0.0020 + TH / 2 + v * TH / 2, y = yc(a) + u * HW; ring.push([Math.sin(a) * r, y, NC + Math.cos(a) * r]); } rings.push(ring); }
      rings.push(rings[0]);
      const g = W.loft(rings, {});
      orientC(g, 3, NU + 1, [0, 1.402, NC]);
      const wNeck = (x, y, z) => { const u = sm(1.395, 1.46, y); return W.mixW(W.wBody(x, Math.min(y, 1.39), z), [BI.neck, 1 - u, BI.head, u], sm(1.386, 1.398, y)); };
      W.part('c7Choker', g, wNeck, { mat: velvet });
    }
    // ======================= the mask =======================
    // A gilded eye mask shaped to her face: laid out flat from the front (the painted outline, made 8% narrower to her narrower face and
    // lifted 4.5 mm, so its eye holes are round her eyes), then each point carried onto her face (W.headPoint) and stood 2.2 mm off it
    // along the face's smoothed direction (further where the face slopes steeply, and over her hair at the temples). A shell 2.4 mm
    // thick with a raised rim round its eye holes. Its gilding and its lacy outline are the close-up painting's (C7_MASK_PIC). Rigid on her head.
    const MASK = (() => {
      const top = (ax) => c1([[0, [1.5485]], [0.023, [1.5455]], [0.041, [1.547]], [0.056, [1.5455]], [0.064, [1.5395]]], ax) + 0.0095 * Math.exp(-Math.pow(ax / 0.0075, 2));   // with the crest
      const bot = (ax) => c1([[0, [1.4935]], [0.006, [1.4895]], [0.012, [1.4815]], [0.0258, [1.4755]], [0.0405, [1.4815]], [0.0525, [1.4915]], [0.060, [1.5045]], [0.0645, [1.522]]], ax);
      const outer = (y) => 0.0648 - 26 * Math.pow(Math.max(0, Math.abs(y - 1.527) - 0.004), 2) * (y < 1.527 ? 1.0 : 2.4);
      const EX = 0.0300, EY = 1.5115, EHW = 0.0182, EHH = 0.0102, TILT = 0.12;
      const hole = (x, y) => { const s = x < 0 ? -1 : 1, dx = s * x - EX, dy = y - EY, u = dx * Math.cos(TILT) + dy * Math.sin(TILT), v = dy * Math.cos(TILT) - dx * Math.sin(TILT);
        const k = Math.pow(Math.max(0, 1 - Math.pow(u / EHW, 2)), 0.62), uu = u / EHW, upper = v > 0 ? 1.0 : 0.85;
        return Math.max(Math.abs(uu) - 1, Math.abs(v) / (EHH * upper) - k) * EHH; };
      const M = (x, y) => { const ax = Math.abs(x); const o = smax(smax(bot(ax) - y, y - top(ax), 0.0015), ax - outer(y), 0.002) - 0.0030;          // 3 mm beyond the painted outline: the picture's alpha cuts the lacy edge
        return smax(o, -hole(x, y), 0.0012); };
      return { M, hole, top, bot, outer };
    })();
    {
      // ph (0 at her crown) for a height on her face; the angle round for a half width
      const phOf = (y) => { let lo = 0.5, hi = 2.6; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (W.headPoint(0, m)[1] > y) lo = m; else hi = m; } return (lo + hi) / 2; };
      const aOf = (x, ph) => { const s = x < 0 ? -1 : 1, hw = Math.abs(W.headPoint(PI / 2, ph)[0]), r = Math.abs(x) / hw; let a;
        if (r < 0.9) { let lo = 0, hi = PI / 2; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (Math.abs(W.headPoint(m, ph)[0]) < Math.abs(x)) lo = m; else hi = m; } a = (lo + hi) / 2; }
        else { let lo = 0, hi = PI / 2; const x9 = 0.9 * hw; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (Math.abs(W.headPoint(m, ph)[0]) < x9) lo = m; else hi = m; } a = (lo + hi) / 2 + 2.3 * (r - 0.9); }
        return s * a; };
      const smoothN = (a, ph) => { const e = 0.05, pa = W.headPoint(a + e, ph, 1e-7), pb = W.headPoint(a - e, ph, 1e-7), pc = W.headPoint(a, ph + e, 1e-7), pd = W.headPoint(a, ph - e, 1e-7);
        return norm(cross(sub(pc, pd), sub(pa, pb))); };
      const fineN = (a, ph) => { const e = 0.006, pa = W.headPoint(a + e, ph), pb = W.headPoint(a - e, ph), pc = W.headPoint(a, ph + e), pd = W.headPoint(a, ph - e);
        return norm(cross(sub(pc, pd), sub(pa, pb))); };
      const H = 0.0013, X0 = -0.068, X1 = 0.068, Y0 = 1.470, Y1 = 1.562, NX = Math.round((X1 - X0) / H), NY = Math.round((Y1 - Y0) / H);
      const val = new Float32Array((NX + 1) * (NY + 1)); for (let i = 0; i <= NY; i++) for (let j = 0; j <= NX; j++) val[i * (NX + 1) + j] = MASK.M(X0 + j * H, Y0 + i * H);
      // the region M < 0, cut cell by cell (each square clipped by the field, edge points shared)
      const P2 = [], key = new Map(), tris = [];
      const vid = (k, x, y) => { let v = key.get(k); if (v === undefined) { v = P2.length; P2.push([x, y]); key.set(k, v); } return v; };
      const corner = (i, j) => vid('c' + i + '_' + j, X0 + j * H, Y0 + i * H);
      const edgePt = (i0, j0, i1, j1) => { const a = val[i0 * (NX + 1) + j0], b = val[i1 * (NX + 1) + j1], t = a / (a - b); const k = 'e' + Math.min(i0 * (NX + 1) + j0, i1 * (NX + 1) + j1) + '_' + Math.max(i0 * (NX + 1) + j0, i1 * (NX + 1) + j1);
        return vid(k, X0 + lerp(j0, j1, t) * H, Y0 + lerp(i0, i1, t) * H); };
      for (let i = 0; i < NY; i++) for (let j = 0; j < NX; j++) {
        const C = [[i, j], [i, j + 1], [i + 1, j + 1], [i + 1, j]], poly = [];
        for (let k = 0; k < 4; k++) { const [ia, ja] = C[k], [ib, jb] = C[(k + 1) % 4], va = val[ia * (NX + 1) + ja], vb = val[ib * (NX + 1) + jb];
          if (va < 0) poly.push(corner(ia, ja)); if ((va < 0) !== (vb < 0)) poly.push(edgePt(ia, ja, ib, jb)); }
        for (let k = 1; k + 1 < poly.length; k++) tris.push(poly[0], poly[k], poly[k + 1]);
      }
      // carry every flat point onto her face
      const phRow = new Map(), n = P2.length, S3 = [], N3 = [], UV = [];
      for (let v = 0; v < n; v++) {
        const [x, y] = P2[v], ky = Math.round(y * 1e6); let ph = phRow.get(ky); if (ph === undefined) { ph = phOf(y); phRow.set(ky, ph); }
        const a = aOf(x, ph), p = W.headPoint(a, ph), ns = smoothN(a, ph), nf = fineN(a, ph), c = Math.max(0.35, ns[0] * nf[0] + ns[1] * nf[1] + ns[2] * nf[2]);
        const u = Math.abs(x) / 0.0648, off = 0.0022 / c + 0.0050 * sm(0.80, 1.0, u) * sm(1.500, 1.530, y) + 0.0016 * sm(0.86, 1.0, u);
        S3.push(add(p, ns, off)); N3.push(ns); UV.push([x, y]);
      }
      // the shell: back face, front face (thicker at the rim), and the rim joining them
      const rimD = (x, y) => -MASK.M(x, y);                        // distance in from the edge
      const pos = [], idx = [], TH = 0.0024;
      for (let v = 0; v < n; v++) { const p = S3[v]; pos.push(p[0], p[1], p[2]); }
      for (let v = 0; v < n; v++) { const p = S3[v], d = rimD(UV[v][0], UV[v][1]), t = TH + 0.0010 * Math.exp(-Math.pow((d - 0.0022) / 0.0014, 2)) - 0.0008 * sm(0.0012, 0.0, d);
        pos.push(p[0] + N3[v][0] * t, p[1] + N3[v][1] * t, p[2] + N3[v][2] * t); }
      for (let t = 0; t < tris.length; t += 3) { idx.push(tris[t], tris[t + 2], tris[t + 1]); idx.push(n + tris[t], n + tris[t + 1], n + tris[t + 2]); }
      // boundary edges: used by one triangle only
      const ec = new Map(); for (let t = 0; t < tris.length; t += 3) for (let k = 0; k < 3; k++) { const a = tris[t + k], b = tris[t + (k + 1) % 3], kk = a < b ? a + '_' + b : b + '_' + a; const e = ec.get(kk); if (e) e.c++; else ec.set(kk, { a, b, c: 1 }); }
      for (const e of ec.values()) if (e.c === 1) { idx.push(e.a, e.b, n + e.b); idx.push(e.a, n + e.b, n + e.a); }
      // which way do the front triangles face? (+z on the middle of the mask)
      const nr = W.computeNormals(pos, idx); let sz = 0; for (let v = n; v < 2 * n; v++) if (Math.abs(UV[v - n][0]) < 0.03) sz += nr[v * 3 + 2];
      if (sz < 0) for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
      const WN = C7_MASK_PIC.win, uv = []; for (let L = 0; L < 2; L++) for (let v = 0; v < n; v++) uv.push((UV[v][0] - WN[0]) / (WN[1] - WN[0]), (UV[v][1] - WN[2]) / (WN[3] - WN[2]));
      W.part('c7Mask', { pos, idx, uv }, () => W.wBone('head'), { mat: maskMat, weld: false });
    }
    // ======================= the mask's ribbon and bow =======================
    // from the mask's sides back over her hair, just above her ears, to a bow at the back of her head under the bun; its two ends hang
    // free down behind her neck. The hair's outer surface along the way was measured on the bun (wardrobe/hair_bun.js) round her head.
    {
      const HC = W.hair.HCX, HR = [[1.10, [0.0690]], [1.20, [0.0680]], [1.40, [0.0705]], [1.60, [0.0805]], [1.80, [0.0835]], [2.00, [0.0805]], [2.20, [0.0820]], [2.40, [0.0820]], [2.60, [0.0870]], [2.80, [0.0900]], [3.00, [0.0912]], [3.1416, [0.0916]]];
      const RW = 0.0058, RT = 0.0008, parts = [];
      const yR = (th) => 1.531 - 0.010 * sm(1.7, 3.0, th);
      const ptR = (th, s) => { const r = c1(HR, th) + 0.0014; return [s * Math.sin(th) * r, yR(th), HC.z + Math.cos(th) * r]; };
      for (const s of [-1, 1]) { const P = [], N = 40;
        for (let k = 0; k <= N; k++) { const th = lerp(1.18, PI - 0.03, k / N), p = ptR(th, s), q = ptR(th + 0.01, s), t = norm(sub(q, p)), nn = norm([s * Math.sin(th), 0, Math.cos(th)]), w = norm(cross(nn, t));
          P.push({ p, w: w[1] < 0 ? [-w[0], -w[1], -w[2]] : w, n: nn, hw: RW, ht: RT }); }
        parts.push(ribbon(P)); }
      const yk = yR(PI) - 0.001, zk = HC.z - (c1(HR, PI) + 0.0045);
      // the knot
      { const P = []; for (let k = 0; k <= 16; k++) { const ph = (k / 16) * TAU; P.push({ p: [0, yk + 0.0058 * Math.sin(ph), zk - 0.0030 + 0.0040 * Math.cos(ph)], w: [1, 0, 0], n: norm([0, Math.sin(ph), Math.cos(ph)]), hw: 0.0062, ht: RT }); } parts.push(ribbon(P)); }
      // two loops, out to the sides and a little up
      for (const s of [-1, 1]) { const P = [], L = 0.034;
        const loopPt = (ph) => [s * (0.005 + L * (1 - Math.cos(ph)) / 2), yk + 0.002 + 0.007 * (1 - Math.cos(ph)) / 2, zk - 0.0035 - 0.0080 * Math.sin(ph) * s + 0.007 * Math.pow((1 - Math.cos(ph)) / 2, 2)];
        for (let k = 0; k <= 26; k++) { const ph = (k / 26) * TAU, p = loopPt(ph), q = loopPt(ph + 0.01), t = norm(sub(q, p)), w = norm(cross(t, [0, 0, 1])), nn = cross(t, w);
          P.push({ p, w, n: nn, hw: RW + 0.0040 * Math.pow((1 - Math.cos(ph)) / 2, 1.5), ht: RT }); }
        parts.push(ribbon(P)); }
      // the two ends, hanging, cut on the slant
      for (const [s, yEnd] of [[-1, 1.428], [1, 1.440]]) { const P = [], N = 24;
        for (let k = 0; k <= N; k++) { const t = k / N, y = lerp(yk - 0.004, yEnd, t), x = s * (0.004 + 0.012 * sm(0, 0.7, t)), z = zk - 0.004 + 0.010 * Math.sin(t * PI * 0.8) * 0.4 + 0.002 * Math.sin(t * 7 + s);
          P.push({ p: [x, y, z], w: norm([1, 0, s * 0.25]), n: [0, 0, -1], hw: RW + 0.0010 * t, ht: RT }); }
        const last = P[P.length - 1]; last.p = [last.p[0], last.p[1] - 0.004 * s, last.p[2]];
        parts.push(ribbon(P)); }
      W.part('c7MaskTie', merge(parts), () => W.wBone('head'), { mat: satinD });
    }

    // ======================= her legs keep out of the skirt =======================
    // (as the festival gown, wardrobe/D1.js: the skirt's chains are turned out past, or up onto, her padded thighs and shins, level by
    // level, each chain going at least 60% as far as its neighbour)
    {
      // Her thighs and knees are hidden skin (below), so there the cloth may lie close (1.6 cm off) and a corner of the cloth between
      // two chains may cut through them unseen; so her hands, resting on her knees in a squat, lie on the skirt and not inside it.
      // Down her shins, where her skin shows, the cloth keeps well off (7.5 cm).
      const T3 = W.THREE, CH = W.chains.filter((c) => c.grp === 'skirt'), NC = CH.length, NL = CH[0].names.length;
      const tipOff = CH.map((c) => c.names.map((nm, k) => new T3.Vector3().subVectors(c.pts[k + 1], c.pts[k])));
      const A = new T3.Vector3(), Hc = new T3.Vector3(), E = new T3.Vector3(), V = new T3.Vector3(), M = new T3.Vector3();
      const pq = new T3.Quaternion();
      const legs = [];
      for (const S of ['R', 'L']) legs.push([new T3.Vector3(), new T3.Vector3(), 0.078, 0.056, 'thigh' + S, 'shin' + S, () => 0.016], [new T3.Vector3(), new T3.Vector3(), 0.056, 0.042, 'shin' + S, 'foot' + S, (t) => lerp(0.016, 0.080, sm(0.0, 0.26, t))]);
      const restOf = (p) => { const out = []; for (const L of legs) { const a = W.SK[L[4]].userData.rest, b = W.SK[L[5]].userData.rest;
        for (let j = 0; j <= 5; j++) out.push(V.copy(a).lerp(b, j / 5).distanceTo(p)); } return out; };
      const restT = CH.map((c) => c.names.map((nm, k) => restOf(c.pts[k + 1])));
      const restM = CH.map((c) => c.names.map((nm, k) => restOf(M.copy(c.pts[k]).add(c.pts[k + 1]).multiplyScalar(0.5))));
      const push = (p, RD, out) => {
        E.set(p.x - Hc.x, 0, p.z - Hc.z); const rl = E.length(); if (rl < 1e-4) return false; E.multiplyScalar(1 / rl);
        let sOut = 0, sUp = 0;
        legs.forEach((L, li) => { for (let k = 0; k <= 5; k++) { const t = k / 5; V.copy(L[0]).lerp(L[1], t); const R = Math.min(L[2] + (L[3] - L[2]) * t + L[6](t), RD[li * 6 + k] - 0.004);
          const vx = p.x - V.x, vy = p.y - V.y, vz = p.z - V.z, cc = vx * vx + vy * vy + vz * vz - R * R; if (cc >= 0) continue;
          const b1 = vx * E.x + vz * E.z, q1 = b1 * b1 - cc; if (q1 > 0) sOut = Math.max(sOut, -b1 + Math.sqrt(q1)); const q2 = vy * vy - cc; if (q2 > 0) sUp = Math.max(sUp, -vy + Math.sqrt(q2)); } });
        if (sOut <= 1e-4 && sUp <= 1e-4) return false;
        if (sUp < sOut) out.set(0, sUp, 0); else out.copy(E).multiplyScalar(sOut); return true;
      };
      const P = CH.map(() => new T3.Vector3()), Tp = CH.map(() => new T3.Vector3()), Q = CH.map(() => new T3.Quaternion()), ANG = new Float32Array(NC), dm = new T3.Vector3();
      const DIR0 = CH.map((c) => c.names.map(() => new T3.Vector3())), dT = new T3.Vector3(), dM = new T3.Vector3(), cur = new T3.Vector3(), qa = new T3.Quaternion();
      const turn = (b, qw) => { b.parent.getWorldQuaternion(pq); b.quaternion.premultiply(pq.clone().invert().multiply(qw).multiply(pq)); b.updateMatrixWorld(true); };
      const tipOf = (ci, k, b, out) => out.copy(tipOff[ci][k]).applyMatrix4(b.matrixWorld).sub(A.setFromMatrixPosition(b.matrixWorld)).add(b.getWorldPosition(V));
      W.onFrame((SK) => {
        for (const L of legs) { SK[L[4]].getWorldPosition(L[0]); SK[L[5]].getWorldPosition(L[1]); }
        SK.hips.getWorldPosition(Hc);
        for (let ci = 0; ci < NC; ci++) for (let k = 0; k < NL; k++) { const b = SK[CH[ci].names[k]]; b.getWorldPosition(M); tipOf(ci, k, b, DIR0[ci][k]).sub(M).normalize(); }
        for (let k = 0; k < NL; k++) {
          for (let ci = 0; ci < NC; ci++) {
            const b = SK[CH[ci].names[k]];
            if (k > 0) { b.getWorldPosition(P[ci]); cur.copy(tipOf(ci, k, b, Tp[ci])).sub(P[ci]).normalize(); if (cur.dot(DIR0[ci][k]) < 0.99999) turn(b, qa.setFromUnitVectors(cur, DIR0[ci][k])); }
            b.getWorldPosition(P[ci]); tipOf(ci, k, b, Tp[ci]); cur.copy(Tp[ci]).sub(P[ci]); const len = cur.length(); cur.multiplyScalar(1 / len);
            ANG[ci] = 0; Q[ci].identity();
            let best = 0;
            if (push(Tp[ci], restT[ci][k], dm)) { dT.copy(Tp[ci]).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dT), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dT); } }
            M.copy(P[ci]).add(Tp[ci]).multiplyScalar(0.5);
            if (push(M, restM[ci][k], dm)) { dM.copy(M).add(dm).sub(P[ci]).normalize(); const a = Math.acos(cl(cur.dot(dM), -1, 1)); if (a > best) { best = a; Q[ci].setFromUnitVectors(cur, dM); } }
            ANG[ci] = best;
          }
          for (let ci = 0; ci < NC; ci++) {
            let qq = Q[ci], a0 = ANG[ci];
            for (const cj of [(ci + 1) % NC, (ci + NC - 1) % NC]) if (ANG[cj] * 0.6 > a0) { a0 = ANG[cj] * 0.6; qq = new T3.Quaternion().slerp(Q[cj], 0.6); }
            if (a0 > 1e-4) turn(SK[CH[ci].names[k]], qq === Q[ci] ? Q[ci] : qq);
          }
        }
      });
    }

    // ======================= paint corrections =======================
    W.afterPaint((parts) => {
      const fix = (mesh, pairs) => { for (const key of ['aPP', 'aPN', 'aPE']) { const at = mesh.geometry.attributes[key]; if (!at) continue; const A = at.array;
        for (const [i, j] of pairs) { A[i * 3] = A[j * 3]; A[i * 3 + 1] = A[j * 3 + 1]; A[i * 3 + 2] = A[j * 3 + 2]; } at.needsUpdate = true; } };
      for (const p of parts) {
        const g = p.mesh.geometry;
        if (p.key === 'c7Skirt') { const pairs = [], src = skirtRows - 5;
          for (let r = skirtRows - 3; r < skirtRows; r++) for (let c = 0; c < skirtCols; c++) pairs.push([r * skirtCols + c, src * skirtCols + c]); fix(p.mesh, pairs); }
        if (p.key === 'c7Corset') {                         // its top edge reads the painted cloth just below it, not her painted skin above
          const P = g.attributes.position.array, PP = g.attributes.aPP.array;
          for (let v = 0; v < PP.length / 3; v++) { const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2], et = topB(x, z) - y; if (et < 0.014) PP[v * 3 + 1] -= (0.014 - Math.max(0, et)) * 0.9; }
          g.attributes.aPP.needsUpdate = true;
        }
      }
    });
    // ======================= what cannot be seen =======================
    W.hideMeshes(['wearBra', 'wearShorts', 'toenail', 'nail']);
    W.hideSkin((x, y, z) => y > 0.80 && y < topB(x, z) - 0.012, ['dollTrunk']);
    W.hideSkin((x, y, z) => y > 0.42, ['dollLeg']);          // her thighs and knees: always under the skirt (see the chains above)
    W.hideSkin((x, y, z) => { const s = x < 0 ? -1 : 1; DOLL.toLocal(s, x, z, L2); return y < cutY(L2[0], L2[1]) - 0.010; }, ['dollFoot']);
    W.hideSkin((x, y, z) => { const S = x < 0 ? 'R' : 'L', f = W.armFrame(S, x, y, z); return f.sl > GL0(f.a) + 0.012 && f.sl < 0.452; }, ['arm']);
  },
};
