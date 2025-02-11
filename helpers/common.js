import { Dimensions } from "react-native";

const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');

export const capitalize = str=>{
    return str.replace(/\b\w/g, l => l.toUpperCase())
}

export const wp = (percentage) => {
    return (percentage * deviceWidth) / 100;
};
export const hp = (percentage) => {
    return (percentage * deviceHeight) / 100;
};

export const stripHtmlTags = (html) => {
    return html.replace(/<[^>]*>?/gm, '');
};