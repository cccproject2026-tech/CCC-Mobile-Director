import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

type Props = {}

const Notes = (props: Props) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Mentee Notes</Text>
        </View>
    )
}

export default Notes

const styles = StyleSheet.create({})