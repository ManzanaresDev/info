# Organisation page:

body (display: flex, flex-direction: column, min-height: 100dvh)
└── main (flex: 1, display: flex, flex-direction: column)
└── .spa-hero (flex: 1)
└── .spa-hero-content (flex: 1, display: flex, flex-direction: column)
└── .spa-hero-btns (margin-top: auto)

## Chaque niveau fait une seule chose :

- body — dit "je veux occuper au minimum tout l'écran, et je distribue l'espace verticalement"
- main — dit "je prends tout l'espace que body me donne, et je le transmets à mes enfants"
- .spa-hero — dit "je prends tout l'espace que main me donne"
- .spa-hero-content — dit "je prends tout l'espace que hero me donne, et je distribue verticalement"
- .spa-hero-btns — dit "je me place tout en bas grâce à l'espace libre au-dessus de moi"
