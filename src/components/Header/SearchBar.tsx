import { icons } from '@/constants';
import React from 'react';
import {
    Image,
    Platform,
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
} from 'react-native';

interface SearchBarProps extends Omit<TextInputProps, 'onChangeText'> {
    value: string;
    onChangeValue: (q: string) => void;
    placeholder?: string;
    style?: StyleProp<TextStyle>;
    backgroundColor?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeValue,
    placeholder = "Search",
    style,
    backgroundColor = '#14517D',
    ...inputProps
}) => (
    <View style={[styles.wrapper, { backgroundColor }]}>
        <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder={placeholder}
            placeholderTextColor="#e1e8f0"
            style={[styles.input, style]}
            {...inputProps}
        />

        <Image source={icons.search} style={styles.icon} />
    </View>
);

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Platform.OS === 'android' ? 12 : 16,
        borderColor: '#d0edf8',
        borderWidth: 1,
        paddingHorizontal: Platform.OS === 'android' ? 14 : 18,
        paddingVertical: Platform.OS === 'android' ? 10 : 11,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: Platform.OS === 'android' ? 14 : 16,
        backgroundColor: 'transparent',
        paddingVertical: 0,
    },
    icon: {
        marginLeft: Platform.OS === 'android' ? 8 : 10,
        width: Platform.OS === 'android' ? 22 : 26,
        height: Platform.OS === 'android' ? 22 : 26,
        tintColor: '#fff',
        resizeMode: 'contain',
    },
});

export default SearchBar;
