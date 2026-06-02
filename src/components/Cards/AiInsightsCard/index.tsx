import { isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle, ImageSourcePropType } from 'react-native';
import { roadmapTheme } from '@/components/ui/design-system';
type Props = {
    title: string;
    desciption: string;
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    data: any
};

const AiInsightCard: React.FC<Props> = ({
    title,
    desciption,
    iconName,
    data
}) => {


    return (
        <View
            style={[
                styles.container as ViewStyle,
            ]}
        >
            <View style={styles.headerContainer}>
                <View style={styles.headerSubContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={18} color={roadmapTheme.textPrimary}  />
                </View>
                <Text style={styles.titleText}>{title}</Text>
                </View>
                <View style={styles.viewAllContainer}>
                                  <Text style={styles.viewAllText}>
                                      View Insights
                                  </Text>
              
                                  <Ionicons
                                      name="chevron-forward"
                                      size={14}
                                      color="#EAF7FF"
                                  />
                              </View>
            </View>
            <Text style={styles.descriptionText}>{desciption}</Text>


     <View style={styles.itemsMainContainer}>


    <View style={styles.itemMainContainer}>
        <View style={styles.itemIconContainer}>
<Ionicons name="people-outline" size={22} color="#77C2F0"/>
</View>
<View style={styles.itemContainer}>
    <Text style={styles.usersText}>
        Overall Users
    </Text>
        <Text style={styles.countText}>
        1248
    </Text>
        <Text style={styles.activeUsersText}>
        Total Active Users
    </Text>
    <View style={styles.caretUpContainer}>
     <Ionicons name="caret-up" color={ "#36DB83" } size={13} /> 
        <Text style={styles.violationText}>
   12% this month
    </Text>
    </View>
</View>
    </View>

<View style={styles.seperatedLine}></View>

        <View style={styles.itemMainContainer}>
              <View style={styles.itemIconContainer}>
<Ionicons name="shield-checkmark-outline" size={18} color="#77C2F0"/>
</View>

<View style={styles.itemContainer}>
    <Text style={styles.usersText}>
        System Health
    </Text>
        <Text style={styles.countText}>
        92%
    </Text>
        <Text style={styles.activeUsersText}>
        System health score
    </Text>
      <View style={styles.caretUpContainer}>
     <Ionicons name="caret-up" color={ "#36DB83" } size={13} /> 
        <Text style={styles.violationText}>
   Good
    </Text>
    </View>
</View>
    </View>


<View style={styles.seperatedLine}></View>

    <View style={[styles.itemMainContainer,{borderRightWidth:0}]}>
          <View style={styles.itemIconContainer}>
<Ionicons name="stats-chart-outline" size={18} color="#77C2F0"/>
</View>
<View style={styles.itemContainer}>
    <Text style={styles.usersText}>
        Performance analytics
    </Text>
        <Text style={styles.countText}>
        85%
    </Text>
        <Text style={styles.activeUsersText}>
        Cource Completion rate
    </Text>
    <View style={styles.caretUpContainer}>
     <Ionicons name="caret-up" color={ "#36DB83" } size={13} /> 
        <Text style={styles.violationText}>
   8% this month
    </Text>
    </View>
</View>
    </View>


    
            </View>

            

        </View>
    );
};

export default AiInsightCard;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent:"space-between",
        marginBottom: 4
    },
    headerSubContainer:{
    display: "flex",
        flexDirection: "row",
        justifyContent:"flex-start",
        alignItems: "center",
    }, 
    itemIconContainer:{
width:"100%",
// paddingLeft:10
    },
    iconContainer: {
             width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginRight:6
    },

    titleText: {
       color: roadmapTheme.textPrimary,
            fontWeight: "800",
            fontSize: isSmallDevice ? 14 : 16,
            letterSpacing: -0.2,
    },
    descriptionText: {
             color: roadmapTheme.textMuted,
    fontSize: isSmallDevice ? 10 : 12,
    lineHeight: 16,
    marginTop: 4,
    },
    itemsMainContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent:"space-between",
        marginTop: 12,
    },



        viewAllText: {
        fontSize: isSmallDevice ? 10 : 12,
        fontWeight: "400",
        color: "rgba(255,255,255,0.75)",
    },

    viewAllContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        marginTop:-14
    },
itemMainContainer:{
        width: "32%",
        display: "flex",
        // flexDirection: "row",
        minHeight:70,
        paddingLeft:"1%",
        // padding:4
        
}, 
    seperatedLine:{
      minHeight:95,
        borderRightWidth:0.8,
        borderColor: "#4E84AC",
    },
itemContainer:{
    // paddingLeft:4
},
usersText:{
    color:"white",
    fontSize:isSmallDevice ? 9 : 10,
    fontWeight:"600"
},
countText:{
    fontSize:isSmallDevice ? 9 : 10,
    fontWeight:"bold",
    color:"white",
    marginTop:4
},
activeUsersText:{
    fontSize:isSmallDevice ? 8 : 9,
     color:"white",
},
violationText:{
      fontSize:isSmallDevice ? 9 : 10,
    fontWeight:"bold",
    color:"#36DB83",
    marginLeft:2
},
caretUpContainer:{
    display:"flex",
    flexDirection:"row",
    alignItems:"center"
}


});
