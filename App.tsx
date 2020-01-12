import React, {Fragment} from 'react';
import {SafeAreaView, Platform, StatusBar, StyleSheet, TouchableOpacity, Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera';

const App = () => {
  const camera = React.useRef(null);
  const [showCamera, setShowCamera] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [text, setText] = React.useState('');

  const takePicture = async() => {
    if (camera.current) {
      const options = { quality: 1, base64: true, fixOrientation: true, forceUpOrientation: true };
      const data = await camera.current.takePictureAsync(options);

      setShowCamera(false);
      setProcessing(true);

      fetch('http://192.168.1.15:8000/detect', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: data.base64
        })
      })
        .then(res => res.json())
        .then(res => {
          setText(res.data);
          setProcessing(false);
        })
        .catch((error) => {
          setProcessing(false);
          console.error(error);
        });
    }
  };

  const getAudio = async() => {
    setProcessing(true);

    fetch('http://192.168.1.15:8000/convert', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text
      })
    })
      .then(res => res.json())
      .then(res => {
        console.log(res)
      })
      .catch((error) => {
        setProcessing(false);
        console.error(error);
      });
  };

  const showCam = () => setShowCamera(true);

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {showCamera && (
          <>
            <RNCamera
              ref={camera}
              captureAudio={false}
              style={styles.camera}
              type={RNCamera.Constants.Type.back}
              androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
            />
            <TouchableOpacity onPress={takePicture} style={styles.footer}>
              <Text style={styles.button}>TAKE PHOTO</Text>
            </TouchableOpacity>
          </>
        )}
        {!showCamera && (
          <>
            <View style={styles.container}>
              {!processing && <Text>{text}</Text>}
              {processing && <Text>Processing</Text>}
            </View>
            {text !== '' && (
              <TouchableOpacity onPress={getAudio} style={styles.footer}>
                <Text style={styles.button}>GET AUDIO</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={showCam} style={styles.footer}>
              <Text style={styles.button}>SHOW CAMERA</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  footer: {
    alignItems: "center" as "center",
    backgroundColor: '#000000',
    height: 60,
    justifyContent: "center" as "center",
  },

  button: {
    color: "#FFFFFF",
    fontSize: 26,
    textAlign: "center" as "center",
  }
});

export default App;
