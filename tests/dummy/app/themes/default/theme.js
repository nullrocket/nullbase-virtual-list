import COLORS from 'nullbase-theme-service/utils/colors';
export default {
  'nb-basic-layout': [
    {
      context: 'default',
      'header-background-color': {
        "standard": COLORS.BLUE_500,

      },
      'right-sidebar-width': "500px",
      'left-sidebar-width': "240px"
    }


  ],

  'nb-button': [
    {
      context: 'default',
      'background-color': {
        "flat-text": COLORS.WHITE,
        "raised-text": COLORS.BLUE_A400,
        'flat-icon': COLORS.BLUE_A400,
        'raised-icon': COLORS.BLUE_A400
      },
      'focused-text-color': {
        "flat-text": COLORS.BLACK,
        "raised-text": COLORS.WHITE,
        'flat-icon': COLORS.WHITE,
        'raised-icon': COLORS.WHITE,
      },
      'text-color': {
        "flat-text": COLORS.BLACK,
        "raised-text": COLORS.WHITE,
        'flat-icon': COLORS.WHITE,
        'raised-icon': COLORS.WHITE,
      },
      'focused-background-color': {
        "flat-text": COLORS.GRAY,
        "raised-text": COLORS.BLUE_A700,
        'flat-icon': COLORS.BLUE_A700,
        'raised-icon': COLORS.BLUE_A700,
      },
      'pressed-background-color': {
        "flat-text": COLORS.GRAY,
        "raised-text": COLORS.BLUE_A700,
        'flat-icon': COLORS.BLUE_A700,
        'raised-icon': COLORS.BLUE_A700
      },
      'pressed-text-color': {
        "flat-text": COLORS.BLACK,
        "raised-text": COLORS.WHITE,
        'flat-icon': COLORS.WHITE,
        'raised-icon': COLORS.WHITE,
      }
    },
    {
      context: 'toolbar',
      'background-color': {
        "flat-text": 'rgba(255,255,0,0.5)',
        "raised-text": '#dddddd',
        'flat-icon': "#aaaaaa",
        'raised-icon': '#333333'
      },

      'focused-text-color': {
        "flat-text": 'red',
        "raised-text": 'red',
        'flat-icon': "red",
        'raised-icon': 'red'
      },
      'text-color': {
        "flat-text": 'red',
        "raised-text": 'red',
        'flat-icon': "red",
        'raised-icon': 'red'
      },
      'focused-background-color': {
        "flat-text": 'red',
        "raised-text": 'red',
        'flat-icon': "red",
        'raised-icon': 'red'
      },
      'pressed-background-color': {
        "flat-text": '#111',
        "raised-text": '#111',
        'flat-icon': '#111',
        'raised-icon': '#111'
      },
      'pressed-text-color': {
        "flat-text": '#fff',
        "raised-text": '#fff',
        'flat-icon': '#fff',
        'raised-icon': '#fff'
      }

    },

    {

      context: 'header',
      'background-color': {
        "flat-text": COLORS.BLUE_500,
        "raised-text": COLORS.BLUE_500,
        'flat-icon': COLORS.BLUE_500,
        'raised-icon': COLORS.BLUE_500
      }


    },
    {
      context: 'nested-header',
      'background-color': {
        "flat-text": COLORS.RED_500,
        "raised-text": COLORS.RED_500,
        'flat-icon': COLORS.RED_500,
        'raised-icon': COLORS.RED_500
      }

    },

    ]
};
