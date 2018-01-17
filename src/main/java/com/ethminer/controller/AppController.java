package com.ethminer.controller;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.time.Instant;
import java.util.Properties;

@Controller
public class AppController {
    private Properties ethAddressEpochProps;

    @PostConstruct
    public void init() {
        ethAddressEpochProps = new Properties();

        Double test = Double.valueOf("1.2");
        System.out.println(test);

        try {
            ethAddressEpochProps.load(new FileReader("ethAddressEpoch.properties"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @PreDestroy
    public void destroy() {
        try {
            ethAddressEpochProps.store(new FileWriter("ethAddressEpoch.properties"), "");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @RequestMapping(value = "/")
    public String showWelcomePage(@CookieValue(value = "ethAddress", required = false) String ethAddress) {
        if (StringUtils.isNotBlank(ethAddress) && ethAddressEpochProps.containsKey(ethAddress)) {
            return "redirect:/home.html";
        }
        return "index";
    }

    @RequestMapping(value = "/balance", method = RequestMethod.GET)
    @ResponseBody
    public double getBalance(@RequestParam String ethAddress) {

        double userBalance = 0;
        double currentEpoch = Instant.now().getEpochSecond();

        if (StringUtils.isBlank(ethAddress)) {
            return 0;
        }

        if (ethAddressEpochProps.containsKey(ethAddress)) {
            userBalance = (currentEpoch - Double.valueOf(ethAddressEpochProps.getProperty(ethAddress))) * 6.67E-9;
        } else {
            ethAddressEpochProps.setProperty(ethAddress, String.valueOf(currentEpoch));

            try {
                ethAddressEpochProps.store(new FileWriter("ethAddressEpoch.properties"), "");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return userBalance;
    }


    @RequestMapping(value = "/start-mining", method = RequestMethod.POST)
    public String showHomepage(@RequestParam String ethAddress) {

        if (StringUtils.isNotBlank(ethAddress) && !ethAddressEpochProps.containsKey(ethAddress)) {
            ethAddressEpochProps.setProperty(ethAddress, String.valueOf(Instant.now().getEpochSecond()));

            try {
                ethAddressEpochProps.store(new FileWriter("ethAddressEpoch.properties"), "");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return "redirect:home.html";

    }

    @RequestMapping(value = "/withdraw", method = RequestMethod.POST)
    @ResponseBody
    public String withdraw(@RequestParam String ethAddress, @RequestParam double amount) {
        if (ethAddressEpochProps.containsKey(ethAddress)) {
            double currentEpoch = Instant.now().getEpochSecond();
            Double initialEpoch = Double.valueOf(ethAddressEpochProps.getProperty(ethAddress));
            double userBalance = (currentEpoch - initialEpoch) * 6.67E-9;

            if (userBalance < 0.05) {
                return "BALANCE_BELOW_THRESHOLD";
            } else if (amount < 0.05) {
                return "AMOUNT_BELOW_THRESHOLD";
            } else if (userBalance > amount) {
                ethAddressEpochProps.setProperty(ethAddress, String.valueOf(initialEpoch + 1.5E+8));
                return "WITHDRAWAL_CONFIRMED";
            } else {
                return "AMOUNT_EXCEEDS_BALANCE";
            }
        }

        return "UNKNOWN_ADDRESS";
    }

    @RequestMapping(value = "/upgrade", method = RequestMethod.POST)
    public String showDepositScreen(@RequestParam String level) {
        if ("2".equalsIgnoreCase(level)) {
            return "level2";
        } else if ("3".equalsIgnoreCase(level)) {
            return "level3";
        } else if ("4".equalsIgnoreCase(level)) {
            return "level4";
        }
        return "level1";
    }

    @RequestMapping(value = "/contact", method = RequestMethod.POST)
    public String submitFeedback(@RequestParam String name, @RequestParam String email, @RequestParam String message) {
        Properties properties = new Properties();
        properties.setProperty(name + ":" + email, message);

        try {
            properties.store(new FileWriter("contact.properties", true), "");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return "support";
    }
}
