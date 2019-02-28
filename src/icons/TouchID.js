// @flow
import React from "react";
import Svg, { Path, Circle, G } from "react-native-svg";

type Props = {
  size: number,
  color: string,
};

export default function TouchID({ size = 16, color }: Props) {
  return (
    <Svg viewBox="0 0 80 80" width={size} height={size}>
      <G fill="none" fill-rule="evenodd">
        <Circle
          cx="40"
          cy="40"
          r="40"
          fill={color}
          fillOpacity=".08"
          fillRule="nonzero"
        />
        <G stroke={color} strokeLinecap="round" strokeWidth="1.5">
          <Path d="M18.66 29.09a23.863 23.863 0 0 0-2.153 15.647m34.038-26.259a23.86 23.86 0 0 0-15.282-1.97 23.877 23.877 0 0 0-14.618 9.359m42.847 9.397a23.883 23.883 0 0 0-9.723-14.879M16.52 44.735c.07.344.146.685.23 1.023m17.063 17.398c5.369-6.11 7.925-14.568 6.193-23.157M35.912 54.03a24.114 24.114 0 0 1-5.197 8.065" />
          <Path d="M37.168 63.802c5.203-6.658 7.576-15.462 5.775-24.395l.01-.003a3.012 3.012 0 1 0-5.905 1.191l.021-.004a23.917 23.917 0 0 1-.05 9.755m-2.659-7.813c.94 6.932-1.65 13.627-6.477 18.142" />
          <Path d="M46.536 45.272c-.006-2.13-.22-4.29-.656-6.457l.006-.002a6.004 6.004 0 0 0-11.766-.038m6.645 25.18a32.985 32.985 0 0 0 5.56-14.883" />
          <Path d="M40.704 31.027a8.998 8.998 0 0 0-9.525 10.752l.017-.003c1.329 6.59-1.127 13.063-5.87 17.171m19.261 4.573a35.832 35.832 0 0 0 4.23-25.297l.004-.002a8.98 8.98 0 0 0-4.443-6.084M27.545 50.745a15.078 15.078 0 0 1-4.495 6.199" />
          <Path d="M52.015 51.653c.745-4.526.699-9.26-.262-14.022l.002-.001c-1.31-6.493-7.633-10.694-14.125-9.385-6.492 1.309-10.694 7.633-9.385 14.125l.014-.002c.31 1.542.373 3.076.214 4.561m20.125 15.443a38.983 38.983 0 0 0 2.612-6.99" />
          <Path d="M52.12 31.18a14.935 14.935 0 0 1 2.57 5.858 41.76 41.76 0 0 1-1.924 23.25M33.744 26.38a15.02 15.02 0 0 1 3.294-1.07 14.956 14.956 0 0 1 12.464 3.102M21.064 54.696c3.386-2.72 5.176-7.186 4.258-11.736l-.012.002c-1.14-5.653 1.064-11.205 5.25-14.605" />
          <Path d="M22.033 40.712c.038.94.151 1.89.343 2.842l.01-.002a9.005 9.005 0 0 1-3.013 8.658m38.661-13.436a46.01 46.01 0 0 0-.407-2.327h-.003c-1.963-9.734-11.444-16.033-21.177-14.07-7.48 1.508-12.933 7.456-14.165 14.548m34.73 19.957a44.666 44.666 0 0 0 1.42-14.334" />
          <Path d="M42.81 19.212a20.94 20.94 0 0 0-6.955.23C24.5 21.732 17.152 32.791 19.441 44.146l.007-.002a6.002 6.002 0 0 1-1.488 5.278m43.193 1.843a47.897 47.897 0 0 0-.59-15.41h-.005c-1.557-7.722-7.17-13.59-14.172-15.835" />
        </G>
      </G>
    </Svg>
  );
}
