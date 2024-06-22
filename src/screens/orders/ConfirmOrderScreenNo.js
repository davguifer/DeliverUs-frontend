import React, { useState, useEffect } from 'react'
import { StyleSheet, FlatList, ScrollView, View, Pressable, Image } from 'react-native'
import * as yup from 'yup'
import { showMessage } from 'react-native-flash-message'
import { brandPrimary, brandPrimaryTap, brandSecondary, flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { Formik } from 'formik'
import { create } from '../../api/OrderEndpoints'
import { getDetail } from '../../api/RestaurantEndpoints'
import TextRegular from '../../components/TextRegular'
import TextError from '../../components/TextError'
import ImageCard from '../../components/ImageCard'
import TextSemibold from '../../components/TextSemibold'
import InputItem from '../../components/InputItem'

export default function ConfirmOrderScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const [products, setProducts] = useState([])
  const [restaurant, setRestaurant] = useState({})
  const initialOrderValues = { address: '', restaurantId: route.params.id, products: [] }

  useEffect(() => {
    async function fetchProducts () {
      try {
        const fetchedRestaurantDetail = await getDetail(route.params.id)
        setProducts(fetchedRestaurantDetail.products)
        setRestaurant(fetchedRestaurantDetail)
        for (let index = 0; index < route.params.quantities.length; ++index) {
          if (route.params.quantities[index] > 0) {
            const product = { productId: fetchedRestaurantDetail.products[index].id, quantity: route.params.quantities[index] }
            initialOrderValues.products.push(product)
          }
        }
      } catch (error) {
        showMessage({
          message: `There was a problem while retrieving the products. ${error}`
        })
      }
    }
    fetchProducts()
  }, [])

  const validationSchema = yup.object().shape({
    address: yup.string().max(75, 'Address too long').required('Address is required.'),
    products: yup.array(yup.object({ quantity: yup.number().required().min(0).integer() }))
  })

  const renderHeader = () => {
    return (
      <View style={styles.restaurantHeaderContainer}>
        <TextRegular textStyle = {{ textAlign: 'left', fontSize: 18, color: 'white' }}>Please, confirm or dismiss your order right below</TextRegular>
        <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
        <TextRegular textStyle={styles.textTitle}>Total Price: {route.params.precioTotal} €</TextRegular>
      </View>
    )
  }

  const renderProduct = ({ item, index }) => {
    if (route.params.quantities[index] > 0) {
      return (
        <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
        >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemibold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemibold>
        <View>
          <TextRegular>Cantidad: <TextRegular>{route.params.quantities[index]}</TextRegular>
            <TextRegular textStyle={{ paddingLeft: 50 }}>Precio total: <TextSemibold>{route.params.price[index]} €</TextSemibold></TextRegular>
          </TextRegular>
        </View>
      </ImageCard>
      )
    }
  }

  const createOrder = async (values) => {
    setBackendErrors([])
    try {
      const createdOrder = await create(values)
      showMessage({
        message: `Order ${createdOrder.id} successfully created. Go to My Orders to check it out!`,
        type: 'success',
        style: flashStyle,
        textStyle: flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <FlatList
      style={styles.list}
      renderItem={renderProduct}
      data={products}
      ListHeaderComponent={renderHeader}
      />
      <Formik
          style = {styles.container}
          validationSchema={validationSchema}
          initialValues={initialOrderValues}
          onSubmit={createOrder}>
          {({ handleSubmit }) => (
          <ScrollView>
            <InputItem
              name='address'
              label='Address'
            />
            {backendErrors &&
            backendErrors.map((error, index) => <TextError key={index}>{error.msg}</TextError>)
            }

          {/* FR4: Confirm or dismiss new order. */}

          <Pressable
            onPress={() => {
              handleSubmit()
            }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? brandPrimaryTap
                  : brandPrimary
              },
              styles.button
            ]}
          >
            <TextRegular textStyle={styles.text}>Confirm</TextRegular>
          </Pressable>
          <Pressable onPress = {() => {
            navigation.navigate('RestaurantDetailScreen', { dirty: true, id: route.params.id })
          }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? '#85929E'
                  : '#AEB6BF'
              },
              styles.button
            ]}
          >
          <TextRegular textStyle={{ color: 'white', fontSize: 16 }}>Discard</TextRegular>
        </Pressable>
        </ScrollView>
          )}
        </Formik>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: brandSecondary
  },
  restaurantHeaderContainer: {
    height: 200,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    marginBottom: 5,
    marginTop: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 18,
    color: 'white',
    paddingTop: 20
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: brandSecondary,
    textAlign: 'center',
    marginLeft: 5
  },
  headerText: {
    color: 'white',
    textAlign: 'center'
  }
})
